(function () {
  var currentSection = 0;
  
  var sections;
  
  /**
   * Retrieves the questions associated with this survey and constructs it accordingly.
   **/
  function buildSurvey ()
  {
    $.getJSON('questions.json', function (json)
    {
      //DEBUG
      //console.log (json);
      
      sections = [{name: 'preface', enabled: true}];
      
      //Used for debugging the JSON
      var lastItem = {type: '', quaifier: ''};
      
      var surveyString = '\n';
      var navString = '\n';
      
      var disableQuestionSet, disableSectionSet;
      var enableQuestionSet, enableSectionSet, enableSectionPositionSet;
      
      try
      {
        $.each (json.sections, function (sectionIndex, section)
        {
          lastItem = {type: 'section', qualifier: section.name};
          
          navString += '<a id="nav-' + section.name + '" href="#" ';
          navString += 'class="disabled nav nav-targeted';
          navString += ((!!section.enabled) ? '' : ' shrunk') + '"';
          navString += ' title="' + section.title + '"></a>\n';
          
          sections.push ({name: section.name, enabled: !!section.enabled});
          
          surveyString += '<section id="section-' + section.name + '" class="hide section-hide">\n';
          surveyString += '<h2>' + section.title + '</h2>\n';
          
          section.questions.forEach (function (question, questionIndex)
          {
            lastItem = {type: 'question', qualifier: question.questionText};
            
            surveyString += '<div id="Q' + section.code + '' + questionIndex + '" ';
            surveyString += ((!!question.enabled_by) ? ('name="' + question.enabled_by + '" ') : '');
            surveyString += 'class="question-wrapper ' + ((!!question.visible) ? 'visible-question' : 'invisible-question') + '">\n';
            surveyString += '<p class="question">\n';
            surveyString += '<strong>Q' + section.code + '' + questionIndex + '</strong>. ';
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
        
        $('#nav-wrapper').html (navString);
        $('#generated-questions').html (surveyString);
        
        //DEBUG
        //console.log (sections);
        //console.log (navString);
        //console.log (surveyString);
        
        //Add handlers after elements are created
        
        /**
         * Handles logic for questions with both exclusive responses. If an exclusive option is selected,
         * all other options should be deselected.
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
            $(this).next ().next ().addClass ('active');
          }
          else
          {
            $(this).next ().next ().removeClass ('active');
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
            
            //Enable a specific section the first time the user navigates to it
            $('#nav-' + sections[currentSection].name).removeClass ('disabled');
            
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
        });
        
        /**
         * Switches the view to a specific target section.
         **/
        $('.nav-targeted').on ('click', function (e)
        {
          e.preventDefault ();
          
          var clicked = this.id.split ('-')[1];
          var targetSection = 0;
          
          for (var count = 0; count < (sections.length - 1); count++)
          {
            targetSection++;
            if (sections[targetSection].name == clicked) break;
          }
          
          if (targetSection == currentSection) return;
          
          hideSection (currentSection);
          currentSection = targetSection;
          showSection (currentSection);
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
  };
  
  /**
   * After 1 second (to account for hide transition of previous section), shows a specific section.
   **/
  function showSection (section)
  {
    //Note: timing must be staggered for animation to trigger successfully
    setTimeout (function ()
    {
      $('#section-' + sections[section].name).removeClass ('hide');
    }, 975);
    
    setTimeout (function ()
    {
      $('#section-' + sections[section].name).removeClass ('section-hide');
    }, 1000);
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
                      .replace(/"/g,"\\\"")
                      .replace(/'/g,"\\\'")
                      .replace(/\&/g, "\\&"); 
  }
  
  /**
   * Runs when the document has loaded
   **/
  $(document).ready (function () {
    buildSurvey ();
  });
  
  
  /**
   * Submits the questionnaire data to the server for processing.
   **/
  $('form').on('submit', function (e) {
    e.preventDefault();
    
    var responses = {};
    var key, values, tmp, tmpValue;
    
    //Prevent erroneous input
    $('nav').addClass ('hide');
    $('input[type=submit]').addClass ('disabled');
    
    //Iterate through each named section which is enabled
    $.each (sections, function (index, section)
    {
      //Iterate through every visible question in this section
      $('#section-' + section.name + ' .question-wrapper.visible-question').each (function (questionIndex)
      {
        key = $(this).prop ('id');
        values = new Array ();
        
        //Check to see which options are checked
        $(this).find ('.option').each (function (optionIndex)
        {
          tmp = $(this).children ().first ();
          
          if (tmp.is ('textarea'))
          {
            values.push (sanitizeJSON (tmp.val ()));
          }
          else if (tmp.is ('input[type=checkbox]'))
          {
            if (tmp.prop ('checked'))
            {
              //Extract the letter
              tmpValue = tmp.attr ('id').split ('_')[1];
              
              //If this option can be specified, retrieve the specification
              tmp = $(this).find ('input[type="text"]')
              
              if (tmp.length)
              {
                tmpValue += ' (' + sanitizeJSON (tmp.val ()) + ')';
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
    // MUST ADD SECURITY TOKEN TO RESPONSE
    
    //DEBUG
    // console.log (responses);
    // console.log (JSON.stringify (responses));
    
    //TODO: Call to web service
    //nonfunctional birched code starts here
    //NOTE: It might not be necessary to stringify the responses set if we make the datatype JSON
    $.ajax({
      url: 'survey.php?do=add_answers',
      type: 'POST',
      contentType:'application/json',
      data: JSON.stringify(responses),
      dataType:'text',
      success: function (response)
      {
        //On ajax success do this
        alert (response);
      },
      error: function (xhr, ajaxOptions, thrownError)
      {
        //On error do this
        // $.mobile.loading('hide')
        if (xhr.status == 200)
        {
          //DEBUG
          alert (ajaxOptions);
        }
        else
        {
          //DEBUG
          alert (xhr.status);
          alert (thrownError);
        }
      }
     });
  });
})();
