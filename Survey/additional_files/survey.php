<?php
/*======================================================================*\
|| #################################################################### ||
|| # Custom Survey Integration for vBulletin 3.8.5                    # ||
|| # ---------------------------------------------------------------- # ||
|| # Copyright ©2016 RPG Crossing. All Rights Reserved.               # ||
|| # This file may not be redistributed in whole or significant part. # ||
|| # ---------------------------------------------------------------- # ||
|| # http://www.rpgcrossing.com | http://www.vbulletin.com            # ||
|| #################################################################### ||
\*======================================================================*/


/*
 *
 * DB SETUP
 *

 CREATE TABLE IF NOT EXISTS vb3_survey (
   userid int(10) unsigned NOT NULL,
   surveyid smallint(5) unsigned NOT NULL,
   questionid varchar(20) NOT NULL,
   answer text,
   dateline int(10) unsigned NOT NULL,
   PRIMARY KEY (surveyid,questionid,userid)
 );

 */

// # SET PHP ENVIRONMENT #
error_reporting(E_ALL & ~E_NOTICE & ~8192);

// # DEFINE IMPORTANT CONSTANTS #
define('NO_REGISTER_GLOBALS', 1);
define('THIS_SCRIPT', 'survey');
define('CSRF_PROTECTION', true); // let's not let nasty folks do nasty things, yeah?

// # PRE-CACHE TEMPLATES AND DATA #
// get special phrase groups
$phrasegroups = array(

);

// get special data templates from the datastore
$specialtemplates = array(

);

// pre-cache templates used by all actions
$globaltemplates = array(
  'rpgx_survey_main',

);

// pre-cache templates used by specific actions
$actiontemplates = array(

);

// # REQUIRE BACK-END #
require_once('./global.php');

// are banned people prevented from filling out surveys???
if (!$vbulletin->userinfo['userid']) // we must be logged in
  print_no_permission();

if (!($vbulletin->userinfo['userid'] == 14566))
  print_no_permission();

// for testing: only admins, mods, and Daq
if (!($vbulletin->userinfo['usergroupid']==6 OR $vbulletin->userinfo['usergroupid']==5 OR $vbulletin->userinfo['userid']==65324 OR $vbulletin->userinfo['userid']==25962))
  print_no_permission();

if(($_REQUEST['do'] == '' || !isset($_REQUEST['do'])))
{
  // script with no parameters
  //
  // DB call to pull up pre-existing info if form has already been filled? Notification text if it is being pulled up
  //
  // Show template for survey
  /*
  $db->free_result($gameRequests);
   */


  $survey_html = file_get_contents('https://rpgcrossing.com/survey/index.html');
  eval('$navbar = "' . fetch_template('navbar') . '";');
  eval('print_output("' . fetch_template('rpgx_survey_main') . '");');
}
else if ($_REQUEST['do'] == 'load_data')
{
  // variable cleanup
  $vbulletin->input->clean_array_gpc('p', array(
    'surveyID' => TYPE_INT,
    'securitytoken' => TYPE_STR
  ));


  //require_once(DIR . '/includes/functions_log_error.php');

  //log_vbulletin_error('load data called with surveyID = ' . $vbulletin->GPC['surveyID'], 'php');

  // encode into json
  // note for future: better to pass a CLASS instance back to json: https://www.html5andbeyond.com/jquery-ajax-json-php/
  $json = json_encode(getExistingResults($db, $vbulletin->GPC['surveyID'], $vbulletin->userinfo[userid]));

  //Return the json string to the client
  echo $json;
}
else if ($_REQUEST['do'] == 'add_answers')
{

  // variable cleanup
  $vbulletin->input->clean_array_gpc('p', array(
    'ajax' => TYPE_BOOL,
    'surveyID' => TYPE_INT,
    'surveyresponses' => TYPE_STR,
    'securitytoken' => TYPE_STR
  ));

  // bad entry point; not from our survey form
  if (!$vbulletin->GPC['ajax'])
    print_no_permission();

  // DEBUG
  //require_once(DIR . '/includes/functions_log_error.php');

  //log_vbulletin_error($vbulletin->GPC['surveyresponses'], 'php');
  // recover array of answers from script
  $response_r = json_decode($vbulletin->GPC['surveyresponses'], true);
  //log_vbulletin_error(print_r($response_r, true), 'php');


  // get stored answers from the DB
  $storedAnswers = getExistingResults($db, $vbulletin->GPC['surveyID'], $vbulletin->userinfo[userid]);

  // for each question and answer, stick it in the DB
  // note that the timestamp will always be the same for ALL answers as currently coded
  //  an alternative would be to read the current answers and online record dates when they are changed
  foreach ( $response_r as $question => $answer )
  {
    $answer = implode(',,,', $answer);

    // only record changed answers
    if (implode(',,,',$storedAnswers[$question]) == stripslashes($answer) )
      continue;

    // DEBUG
    //log_vbulletin_error("not skipping $question with answer" . stripslashes($answer), 'php');
    //log_vbulletin_error("compare to " . implode(',,,',$storedAnswers[$question]), 'php');

    $question = $db->escape_string($question);
    $answer = $db->escape_string($answer); // just in case; expect nothing to escape here
    //log_vbulletin_error($question . ' : ' . $answer, 'php');

    $db->query_write("
      INSERT INTO " . TABLE_PREFIX . "survey (userid, surveyid, dateline, questionid, answer)
      VALUES (" . $vbulletin->userinfo[userid] . ', ' . $vbulletin->GPC['surveyID'] . ", " . TIMENOW . ", '$question', '$answer')
      ON DUPLICATE KEY UPDATE dateline = VALUES(dateline), answer = VALUES(answer)
      ");
  }

  // returning from AJAX call to fill field on form
  // valid HTML message text.
  echo '<p style="text-align:center;color:maroon;padding:2em">Your results have been saved. Thank you for taking the time to complete our survey!
    <br /><br />If you wish to view or edit your answers, please reload the survey, which will be preloaded with your current answers.</p>';
  return;
}
else if ($_REQUEST['do'] == 'view_results')
{
  // pull data from DB into array
  // load data into arrays for display - for each, specify chart type and all data
  // PROBLEM: answer type is not specified! (exclusive vs non-exclusive vs. text)
  // if exclusive, no text: show pie chart OR bar chart showing % who selected a given answer
  // if exclusive with text: show pie chart with * to fields with lists of similar terms, and spoilerbutton type display of all terms
  // if non-exclusive... bar chart showing % of users who selected a given answer? (if sum > 100 then indicate multi answer?)
  // if non-exclusive with text: bar chart with *
  // if text box -- word jumble, with all answers in drop down?
  //
} else { 
  print_no_permission();
}


// call with $vbulletin->GPC['surveyID'], $vbulletin->userinfo[userid]
function getExistingResults($db, $surveyID, $userID) {

  // pull existing survey Nesults if any from the DB
  $resultsFromDB = $db->query_read("
    SELECT questionid, answer FROM " . TABLE_PREFIX . "survey
    WHERE userid = $userID AND surveyID = $surveyID"
  );

  $existingResults = array();
  while ($array = $db->fetch_array($resultsFromDB))
    $existingResults[stripslashes($array['questionid'])] = explode(',,,',stripslashes($array['answer']));
  return $existingResults;
}
?>
