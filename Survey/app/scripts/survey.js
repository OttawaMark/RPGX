// main.js
// 
// javascript support for RPG Crossing survey
//
// NOTE: vBulletin defines and obscures console; console calls will not show up when
// running this script from vBulletin pages

(function () {
  var currentSection = 0;

  var sections;
  var numQuestions, numAnswers;

  var isMobile = false; //initiate as false
  // device detection
  if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|Android|Silk|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(navigator.userAgent) 
      || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(navigator.userAgent.substr(0,4))) isMobile = true;

  /**
   * Retrieves the questions associated with this survey and constructs it accordingly.
   **/
  function buildSurvey ()
  {
    function myGetJSON() {
      return $.getJSON('questions.json', function (json)
          {
            //DEBUG
            //console.log (json);

            sections = [{name: 'preface', enabled: true}];

            //Used for debugging the JSON
            var lastItem = {type: '', qualifier: ''};

            var navImgFile = json.surveyInfo.navImages;
            var navImgSize = json.surveyInfo.navImageSize;
            var navImgCount = 0; // will be incremented during nav bar building

            var surveyString = '\n';
            var navString = '\n';
            var navString = '\n<a id="nav-' + sections[0].name + '" href="#" ';
            navString += 'class="nav nav-targeted" title="' + sections[0].name[0].toUpperCase() + sections[0].name.slice(1)  + '"></a>\n';

            var disableQuestionSet, disableSectionSet;
            var enableQuestionSet, enableSectionSet, enableSectionPositionSet;

            try
            {
              $('input[name=surveyID]').val(json.surveyInfo.id);
            }
            catch (e)
            {
              alert(e);
              console.error (e);
              console.error ('Survey header malformed.');
            }
            

            try
            {
              $.each (json.sections, function (sectionIndex, section)
                  {

                    lastItem = {type: 'section', qualifier: section.name};
                    navImgCount++;

                    navString += '<a id="nav-' + section.name + '" href="#" ';
                    navString += 'class="disabled nav nav-targeted';
                    navString += ((!!section.enabled) ? '' : ' shrunk') + '"';
                    navString += ' style="background-position: ' + (-1 * navImgCount * navImgSize/2) + 'px"';
                    navString += ' title="' + section.title + '"></a>\n';

                    sections.push ({name: section.name, enabled: !!section.enabled});

                    surveyString += '<section id="section-' + section.name + '" class="hide section-hide">\n';
                    surveyString += '<h2>' + section.title + '</h2>\n';
                    surveyString += '<h3 id="percentComplete"></h3>\n';

                    section.questions.forEach (function (question, questionIndex)
                        {
                          lastItem = {type: 'question', qualifier: question.questionText};


                          surveyString += '<div id="Q' + section.code + '' + questionIndex + '" ';
                          surveyString += ((!!question.enabled_by) ? ('name="' + question.enabled_by + '" ') : '');
                          surveyString += 'class="question-wrapper ' + ((!!question.visible) ? 'visible-question' : 'invisible-question') + '">\n';
                          surveyString += '<p class="question">\n';
                          surveyString += '<span class="subtitle">' + section.title.toUpperCase() + '</span>';
                          surveyString += '<strong> &#35;' + (questionIndex + 1) + '</strong>. ';
                          surveyString += question.questionText + '\n</p>\n';

                          question.options.forEach (function (option, optionIndex)
                              {
                                lastItem = {type: 'option', qualifier: ((question.type == 'text') ? 'text: ' + question.questionText : option.value)};

                                surveyString += '<div class="option">\n';

                                if (option.type == 'text')
                                {
                                  surveyString += '<textarea ';
                                  surveyString += 'id="txtQ' + section.code + '' + questionIndex + '_' + optionIndex + '" ';
                                  surveyString += 'rows="4"></textarea>\n';
                                }
                                else
                                {
                                  surveyString += '<input type="checkbox" ';
                                  surveyString += 'id="chkQ' + section.code + '' + questionIndex + '_' + optionIndex + '" ';
                                  surveyString += 'class="' + ((option.type == 'exclusive') ? 'exclusive' : 'non-exclusive');
                                  surveyString += ((!!option.specify) ? ' specify' : '');

                                  enableQuestionSet = '';
                                  enableSectionSet = '';
                                  enableSectionPositionSet = '';
                                  disableQuestionSet = '';
                                  disableSectionSet = '';

                                  if (!!option.enables.length)
                                  {
                                    option.enables.forEach (function (enableItem, enableItemIndex)
                                        {
                                          if (enableItem.type == 'question')
                                          {
                                            enableQuestionSet += enableItem.name + ' ';
                                          }

                                          if (enableItem.type == 'section')
                                          {
                                            enableSectionSet += enableItem.name + ' ';
                                            enableSectionPositionSet += enableItem.position + ' ';
                                          }
                                        });

                                    surveyString += ((!!enableQuestionSet.length) ? ' question-enable' : '');
                                    surveyString += ((!!enableSectionSet.length) ? ' section-enable' : '');
                                  }

                                  if (!!option.disables.length)
                                  {
                                    option.disables.forEach (function (disableItem, disableItemIndex)
                                        {
                                          if (disable.type == 'question')
                                          {
                                            disableQuestionSet += disableItem.name + ' ';
                                          }

                                          if (disable.type == 'section')
                                          {
                                            disableSectionSet += disableItem.name + ' ';
                                          }
                                        });

                                    surveyString += ((!!disableQuestionSet.length) ? ' question-disable' : '');
                                    surveyString += ((!!disableSectionSet.length) ? ' section-disable' : '');
                                  }

                                  surveyString += '"';

                                  if (!!enableQuestionSet.length)
                                  {
                                    surveyString += ' data-question-enable="' + enableQuestionSet.trim () + '"';
                                  }

                                  if (!!enableSectionSet.length)
                                  {
                                    surveyString += ' data-section-enable="' + enableSectionSet.trim () + '"';
                                    surveyString += ' data-section-enable-position="' + enableSectionPositionSet.trim () + '"';
                                  }

                                  if (!!disableQuestionSet.length)
                                  {
                                    surveyString += ' data-question-disable="' + disableQuestionSet.trim () + '"';
                                  }

                                  if (!!disableSectionSet.length)
                                  {
                                    surveyString += ' data-section-disable="' + disableSectionSet.trim () + '"';
                                  }

                                  surveyString += ' />\n';

                                  //Fancy checkboxes
                                  surveyString += '<label ';
                                  surveyString += 'for="chkQ' + section.code + '' + questionIndex + '_' + optionIndex + '">';
                                  surveyString += '</label>\n';

                                  //Question text
                                  surveyString += '<label ';
                                  surveyString += 'for="chkQ' + section.code + '' + questionIndex + '_' + optionIndex + '">';
                                  surveyString += option.value + '</label>\n';

                                  if (!!option.specify)
                                  {
                                    surveyString += '<input type="text" ';
                                    surveyString += 'id="txtQ' + section.code + '' + questionIndex + '_' + optionIndex + '" ';
                                    surveyString += 'placeholder="Please specify" class="specification" />\n';
                                  }
                                }

                                surveyString += '</div>\n';
                              });

                          surveyString += '</div>\n';
                        });

                    surveyString += '</section>\n';
                  });

              sections.push ({name: 'submit', enabled: true});


              navString += '\n<a id="nav-submit" href="#" ';
              navString += ' style="background-position: ' + (-1 * (navImgCount+1) * navImgSize/2) + 'px"';
              navString += 'class="nav nav-targeted disabled" title="Submit"></a>\n';
              $('#nav-wrapper').html (navString);
              $('#generated-questions').html (surveyString);

              //DEBUG
              //console.log (sections);
              //console.log (navString);
              //console.log (surveyString);

              /**
               * Handles logic for questions with exclusive responses. If an exclusive option is
               * selected, all other options should be deselected.
               * 
               * Structure:
               *    <wrapper>
               *      <option>
               *        <question>
               *      <option>
               *        <question>
               **/
              $('.exclusive').on ('change', function ()
                  {
                    if (this.checked)
                    {
                      $(this).parent ().parent ().find ('.non-exclusive').each (function (index)
                          {
                            var tmp = $(this).prop ('checked');

                            $(this).prop ('checked', false);
                            if (tmp) $(this).trigger('change');
                          });

                      var current = this;

                      $(this).parent ().parent ().find ('.exclusive').each (function (index)
                          {
                            if (this != current)
                            {
                              $(this).prop('checked', false);
                              $(this).trigger('change');
                            }
                          });
                    }
                  });

              /**
               * Handles logic for questions with both exclusive responses. If a non-exclusive
               * option is selected, the exclusive option should be deselected to prevent conflicts.
               * 
               * Structure: See above
               **/
              $('.non-exclusive').on ('change', function ()
                  {
                    if (this.checked)
                    {
                      $(this).parent ().parent ().find ('.exclusive').each (function (index)
                          {
                            $(this).prop('checked', false);
                            $(this).trigger('change');
                          });
                    }
                  });

              /**
               * Expands or hides the "please specify" text box associated with questions that require it.
               * 
               * Structure:
               *   <Question>
               *   <Label>
               *   <Specification>
               **/
              $('.specify').on ('change', function (event)
                  {
                    if (event.currentTarget.checked)
                    {
                      $(this).next ().next ().next().addClass ('active');
                    }
                    else
                    {
                      $(this).next ().next ().next().removeClass ('active');
                    }
                  });

              /**
               * Handles dynamic section enabling based on question responses.
               **/
              $('[data-section-enable]').on ('change', function ()
                  {
                    var targetSections = this.dataset.sectionEnable.split (' ');
                    var status = this.checked;

                    targetSections.forEach (function (target, index)
                        {
                          sections.forEach (function (section, sectionIndex)
                              {
                                if (section.name == target)
                                {
                                  section.enabled = !!status;

                                  if (!!status)
                                  {
                                    $('#nav-' + target).removeClass ('shrunk');
                                  }
                                  else
                                  {
                                    $('#nav-' + target).addClass ('shrunk');
                                  }
                                }
                              });
                        });
                  });

              /**
               * Handles dynamic section disabling based on question responses.
               **/
              $('[data-section-disable]').on ('change', function ()
                  {
                    var targetSections = this.dataset.sectionDisable.split (' ');
                    var status = this.checked;

                    targetSections.forEach (function (target, index)
                        {
                          sections.forEach (function (section, sectionIndex)
                              {
                                if (section.name == target)
                                {
                                  section.enabled = !status;

                                  if (!!status)
                                  {
                                    $('#nav-' + target).addClass ('shrunk');
                                  }
                                  else
                                  {
                                    $('#nav-' + target).removeClass ('shrunk');
                                  }
                                }
                              });
                        });
                  });

              /**
               * Handles dynamic question enabling based on question responses.
               **/
              $('[data-question-enable]').on ('change', function ()
                  {
                    var targetQuestions = this.dataset.questionEnable.split (' ');

                    if (this.checked)
                    {
                      targetQuestions.forEach (function (question, index)
                          {
                            $('[name=' + question + ']').removeClass ('invisible-question');
                            $('[name=' + question + ']').addClass ('visible-question');
                          });
                    }
                    else
                    {
                      targetQuestions.forEach (function (question, index)
                          {
                            $('[name=' + question + ']').removeClass ('visible-question');
                            $('[name=' + question + ']').addClass ('invisible-question');
                          });
                    }
                  });

              /**
               * Handles dynamic question disabling based on question responses.
               **/
              $('[data-question-disable]').on ('change', function ()
                  {
                    var targetQuestions = this.dataset.questionDisable.split (' ');

                    if (this.checked)
                    {
                      targetQuestions.forEach (function (question, index)
                          {
                            $('[name=' + question + ']').removeClass ('visible-question');
                            $('[name=' + question + ']').addClass ('invisible-question');
                          });
                    }
                  });

              /**
               * Handles navigation to the next section
               **/
              $('.nav-next').on ('click', function (e)
                  {
                    e.preventDefault ();

                    if (currentSection < (sections.length - 1))
                    {
                      hideSection (currentSection);

                      while (!sections[++currentSection].enabled);

                      showSection (currentSection);

                      $('.nav-previous').removeClass ('disabled');


                      /* REMOVED: now 'enabling' the nav when the user answers a question
                      //Enable a specific section the first time the user navigates to it
                      $('#nav-' + sections[currentSection].name).removeClass ('disabled');
                      */

                      if (currentSection == (sections.length - 1))
                      {
                        $('.nav-next').addClass ('disabled');
                      } 
                    }
                  });

              /**
               * Handles navigation to the previous section
               **/
              $('.nav-previous').on ('click', function (e)
                  {
                    e.preventDefault ();

                    if (currentSection > 0)
                    {
                      hideSection (currentSection);

                      while (!sections[--currentSection].enabled);

                      showSection (currentSection);

                      $('.nav-next').removeClass ('disabled');

                      if (currentSection == 0)
                      {
                        $('.nav-previous').addClass ('disabled');
                      }
                    }
                    //$("html, body").animate({ scrollTop: $("#survey-top").offset().top }, 500);
                  });

              /**
               * Switches the view to a specific target section.
               **/
              $('.nav-targeted').on ('click', function (e)
                  {
                    e.preventDefault ();

                    var clicked = this.id.split ('-')[1];
                    var targetSection = 0;

                    for (var count = 0; count < (sections.length ); count++)
                    {
                      if (sections[targetSection].name == clicked) break;
                      targetSection++;
                    }

                    if (targetSection == currentSection) return;


                    hideSection (currentSection);
                    currentSection = targetSection;
                    showSection (currentSection);

                    // ensure next and prev buttons are properly enabled
                    if (currentSection == 0) {
                      $('.nav-next').removeClass ('disabled');
                      $('.nav-previous').addClass ('disabled');
                    }
                    else if (currentSection == (sections.length - 1)) {
                      $('.nav-next').addClass ('disabled');
                      $('.nav-previous').removeClass ('disabled');
                    }
                    else {
                      $('.nav-next').removeClass ('disabled');
                      $('.nav-previous').removeClass ('disabled');
                    }
                    //$("body").animate({ scrollTop: $("#survey-top").offset().top }, 500);
                  });

              $('.nav-next').removeClass ('disabled');
            }
            catch (e)
            {
              console.error (e);
              console.error ('Survey questions malformed. (' + lastItem.type + ', ' + lastItem.qualifier + ')');
                  }
                  });
    }

    // given an array, go through the questions in the survey and fill in the answer if it exists in the responses data set
    function fillInResponses( responses )
    {
      var qID, answerNum, mainQ;

      // will build array of sections, then activate them
      var active_sections = [];

      // CHECKBOXES

      // select every element that starts with chk
      $("input[id^='chk']").each( function () {
        // pull it apart
        mainQ = this;
        qID = mainQ.id.split('_')[0].substring(3);
        answerNum = mainQ.id.split('_')[1];
        // look at the array of answers for each question
        // any number that is listed is checked
        $.each(responses[qID], function (index, value) {
          // regex for matching digit - space - bracketed words
          // index = 1 is digit
          // index = 3 is text field
          bits = value.match(/^(\d+)(\s+\((.*)\))?$/);
          if (bits && bits[1] == answerNum)
          {
            // found an answered checkbox
            
            // store its parent section
            if (active_sections.indexOf($(mainQ).parents("section").attr('id')) == -1 )
              active_sections.push($(mainQ).parents("section").attr('id'));

            $(mainQ).prop ('checked', true);
            // trigger change events
            $(mainQ).trigger('change');
            if (bits[3]) {
              $("input[id='txt" + mainQ.id.substring(3) + "']").val(bits[3]);
            }
            return;
          }
        });

      });

      // TEXTAREAS
      //
      // find every textarea, with names like txtQU19_0
      // fill in data, if it exists, from the json

      $("textarea[id^='txt']").each( function () {
        // pull it apart
        mainQ = this;
        qID = mainQ.id.split('_')[0].substring(3);
        answerNum = mainQ.id.split('_')[1];
        // we're pulling an array, but each should have a single element only
        // with text in it
        if (responses[qID] && responses[qID][0])
        {
          // store its parent section
            if (active_sections.indexOf($(mainQ).parents("section").attr('id')) == -1 )
              active_sections.push($(mainQ).parents("section").attr('id'));

          $(mainQ).val(responses[qID][0]);
          // trigger change events
          $(mainQ).trigger('change');
        }
      });

      // turn on navigation for active sections
      $.each(active_sections, function (index, section) {
        $('#nav' + section.substring(7)).removeClass('disabled');
      });

      // always add submit section if there are previous answers
      if (active_sections.length > 0)
        $('#nav-submit').removeClass('disabled');
    }


    function populateSurvey ()
    {
      // add unique ID from json survey file
      var returnString = '&surveyID=' + $('input[name=surveyID]').val();

      // add vBulletin's security token
      returnString += '&securitytoken=' + $('input[name=securitytoken]').val();

      return $.ajax({
        url: 'survey.php?do=load_data',
        type: 'POST',
        data: returnString,
        dataType:'json', // return data
        success: function(responses){
          fillInResponses(responses);
        },
        error: function(xhr, ajaxOptions, thrownError) {
          //On error do this
          //        $.mobile.loading('hide')
          if (xhr.status == 200) {
            alert(ajaxOptions);
          }
          else {
            alert(xhr.status);
            alert(thrownError);
          }
        }
      });

    }



    myGetJSON().then(function () {
      return populateSurvey();
    }).then( function () {
      saveSurveySoFar(); // will update the counts

      // saving on every data entry cause server overload... CAN'T DO THIS
      /*$( "#surveyForm input[id^=chk]" ).on("change", function() {
        saveSurveySoFar();
      });
      $( "#surveyForm input[id^=txt], #surveyForm textarea[id^=txt]" ).on("input propertychange", function() {
        saveSurveySoFar();
      });*/
/*
// ORDER IS WRONG HERE
      $( ".nav-previous, .nav-next, .nav-targeted").on('click', function() {
        saveSurveySoFar();
      });
*/

    });


    //return true;
  }

  /**
   * Fades out a specific section, and then removes it once the transition completes.
   **/
  function hideSection (section)
  {
    $('#section-' + sections[section].name).addClass ('section-hide');

    setTimeout (function ()
        {
          $('#section-' + sections[section].name).addClass ('hide');
        }, 1000);
    $('#nav-' + sections[section].name).removeClass ('current');
  };

  /**
   * After 1 second (to account for hide transition of previous section), shows a specific section.
   **/
  function showSection (section)
  {
    //Note: timing must be staggered for animation to trigger successfully
    saveSurveySoFar();
    setTimeout (function ()
        {
          $('#section-' + sections[section].name).removeClass ('hide');
        }, 975);

    setTimeout (function ()
        {
          $('#section-' + sections[section].name).removeClass ('section-hide');
        }, 1000);
    $('#nav-' + sections[section].name).addClass ('current');
    $('#section-' + sections[section].name + ' #percentComplete').html ( '[survey is ' + Math.min(100,Math.ceil(100 * numAnswers / numQuestions)) + '% complete]');
    $("html, body").animate({ scrollTop: $("#survey-top").offset().top }, 500);
  };

  /**
   * Sanitizes JSON strings.
   * 
   * Taken from https://gist.github.com/jamischarles/1046671
   **/
  function sanitizeJSON (unsanitized)
  {
    return unsanitized.replace(/\\/g, "\\\\")
      .replace(/\n/g, "\\n")
      .replace(/\r/g, "\\r")
      .replace(/\t/g, "\\t")
      .replace(/\f/g, "\\f")
      .replace(/"/g,  "\\\"")
      .replace(/'/g,  "\\\'")
      .replace(/\&/g, "\\&"); 
  }

  /**
   * Submits the questionnaire data to the server for processing.
   **/
  $('form').on('submit', function (e)
      {
        e.preventDefault();

        //Prevent erroneous input
        $('nav').addClass ('hide');

        // We're done
        $('.closing').addClass('hide');

        // redundant
        //$('input[type=submit]').addClass ('disabled');

        saveSurveySoFar (true);
      });

  function saveSurveySoFar (formDone)
  {
    formDone = typeof formDone !== 'undefined' ? formDone : false;

    var responses = {};
    var key, values, tmp, tmpValue;
    numQuestions = 0;
    numAnswers = 0;
    var qAnswered;

    //Iterate through each named section which is enabled
    $.each (sections, function (index, section)
        {
          if ( !section.enabled )
            return true;
          //Iterate through every visible question in this section
          $('#section-' + section.name + ' .question-wrapper.visible-question').each (function (questionIndex)
              {
                numQuestions += 1;
                qAnswered = false;
                key = $(this).prop ('id');
                values = new Array ();

                //Check to see which options are checked
                $(this).find ('.option').each (function (optionIndex)
                    {
                      tmp = $(this).children ().first ();

                      if (tmp.is ('textarea'))
                      {
                        if (tmp.val() && !qAnswered) {
                          qAnswered = true;
                          numAnswers += 1;

                        // currently allowing 'disabled' navs to be clicked
                        $("#nav-" + section.name).removeClass('disabled');

                        }
                        values.push (sanitizeJSON (tmp.val ()));
                      }
                      else if (tmp.is ('input[type=checkbox]'))
                      {
                        if (tmp.prop ('checked'))
                        {
                          if (!qAnswered) {
                            qAnswered = true;
                            numAnswers += 1;

                        // currently allowing 'disabled' navs to be clicked
                        $("#nav-" + section.name).removeClass('disabled');

                          }

                          //Extract the letter
                          tmpValue = tmp.attr ('id').split ('_')[1];

                          //If this option can be specified, retrieve the specification
                          tmp = $(this).find ('input[type="text"]')

                            if (tmp.length)
                            {
                              tmpValue += ' (' + tmp.val () + ')';
                                  }

                                  values.push (tmpValue);
                                  }
                                  }
                                  else
                                  {
                                    console.err ('Type error.');
                                  }
                                  });

                              responses[key] = values;
              });
        });
    // update the Google Chart here

    //DEBUG
    //console.log (responses);
    //console.log (JSON.stringify (responses));

    var returnString = '&surveyresponses=' + encodeURIComponent(JSON.stringify (responses));

    // add unique ID from json survey file
    returnString += '&surveyID=' + $('input[name=surveyID]').val();

    // if this puts us over the edge for a CS coupon, register that
    if (numAnswers / numQuestions >= 0.75)
      returnString += '&CS_award=1';

    // add vBulletin's security token
    returnString += '&securitytoken=' + $('input[name=securitytoken]').val();

    var req = $.ajax({
      url: 'survey.php?do=add_answers',
      type: 'POST',
      data: returnString,
      dataType:'html', // return data
      success: function(server_responses){
        if (formDone)
          //On ajax success do this
          $( "#successMessage" ).html( server_responses );
      },
      error: function(xhr, ajaxOptions, thrownError) {
        //On error do this
        //        $.mobile.loading('hide')
        if (xhr.status == 200) {

          alert(ajaxOptions);
        }
        else {
          alert(xhr.status);
          alert(thrownError);
        }
      }
    });

 }

  /**
   * Runs when the document has loaded
   **/
  $(document).ready (function () {
    //test for touch events support and if not supported, attach .no-touch class to the HTML tag.
    if (!("ontouchstart" in document.documentElement)) {
      document.documentElement.className += " no-touch";
    }

    buildSurvey();
  });

})();
