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


  // REMOVE ME
  require_once(DIR . '/includes/functions_log_error.php');

  // pull existing survey results if any from the DB
  $resultsFromDB = $db->query_read("
    SELECT questionid, answer FROM " . TABLE_PREFIX . "survey
    WHERE userid = " . $vbulletin->userinfo[userid] . " AND surveyID =" . $vbulletin->GPC['surveyID'] 
  );

  $existingResults = array();
  while ($array = $db->fetch_array($resultsFromDB))
    $existingResults[$array['questionid']] = explode(',,,',$array['answer']);
  log_vbulletin_error(print_r($existingResults, true), 'php');

  // encode into json
  // note for future: better to pass a CLASS instance back to json: https://www.html5andbeyond.com/jquery-ajax-json-php/
  $json = json_encode($existingResults);

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

  // recover array of answers
  $response_r = json_decode($vbulletin->GPC['surveyresponses'], true);

  // for each question and answer, stick it in the DB
  // note that the timestamp will always be the same for ALL answers as currently coded
  //  an alternative would be to read the current answers and online record dates when they are changed
  foreach ( $response_r as $question => $answer )
  {
    $question = $db->escape_string($question);
    $answer = $db->escape_string(implode(',,,', $answer));

    $db->query_write("
      INSERT INTO " . TABLE_PREFIX . "survey (userid, surveyid, dateline, questionid, answer)
      VALUES (" . $vbulletin->userinfo[userid] . ', ' . $vbulletin->GPC['surveyID'] . ", " . TIMENOW . ", '$question', '$answer')
      ON DUPLICATE KEY UPDATE dateline = VALUES(dateline), answer = VALUES(answer)
      ");
  }

  // returning from AJAX call to fill field on form
  // valid HTML message text.
  echo '<p style="text-align:center;color:maroon;padding:2em">Your results have been saved. Thank you for taking the time to complete our survey!<br /></p>';
  return;
} else { echo $_REQUEST['do']; echo 'bad location'; }
?>
