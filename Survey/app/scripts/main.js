(function () {
  var currentSection = 0;
  
  var sections = ['preface',
                  'index',
                  'user',
                  'demographics'];
  
  /**
   * Fades out a specific section, and then removes it once the transition completes.
   **/
  function hideSection (section)
  {
    $('#section-' + sections[section]).addClass ('section-hide');
    
    setTimeout (function ()
    {
      $('#section-' + sections[section]).addClass ('hide');
    }, 1000);
  };
  
  /**
   * After 1 second (to account for hide transition of previous section), shows a specific section.
   **/
  function showSection (section)
  {
    //DEBUG
    console.log (sections[section]);
    
    //Note: timing must be staggered for animation to trigger successfully
    setTimeout (function ()
    {
      $('#section-' + sections[section]).removeClass ('hide');
    }, 975);
    
    setTimeout (function ()
    {
      $('#section-' + sections[section]).removeClass ('section-hide');
    }, 1000);
  };
  
  /**
   * Runs when the document has loaded
   **/
  $(document).ready (function () {
    $('.nav-next').removeClass ('disabled');
  });
  
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
        if ($(this).prop ('checked')) $(this).trigger ('change');
        $(this).prop ('checked', false);
      });
      
      var current = this;
      
      $(this).parent ().parent ().find ('.exclusive').each (function (index)
      {
        if (this != current) $(this).prop('checked', false);
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
  $('.specify').on ('change', function ()
  {
    $(this).next ().next ().toggleClass ('active');
  });
  
  /**
   * Handles dynamic section enabling based on question responses.
   **/
  $('.section-enable').on ('change', function ()
  {
    var targetSection = this.dataset.section;
    
    if (this.checked)
    {
      sections.splice (this.dataset.sectionPosition, 0, targetSection);
      $('#nav-' + targetSection).removeClass ('shrunk');
    }
    else
    {
      //NOTE: This does not use sectionPosition because multiple sections may be inserted
      for (var count = 0; count < sections.length; count++)
      {
        if (sections[count] == targetSection)
        {
          sections.splice (count, 1);
          break;
        }
      }
      
      $('#nav-' + targetSection).addClass ('shrunk');
    }
    
    //DEBUG
    console.log (sections);
  });
  
  /**
   * Handles dynamic section disabling based on question responses. Note that this becomes necessary
   * when a section-enable response is deactivated programmatically when a section-disable response
   * is selected
   **/
  $('.section-disable').on ('change', function ()
  {
    var targetSection = this.dataset.section;
    
    if (this.checked)
    {
      for (var count = 0; count < sections.length; count++)
      {
        if (sections[count] == targetSection)
        {
          sections.splice (count, 1);
          break;
        }
      }
      
      $('#nav-' + targetSection).addClass ('shrunk');
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
      currentSection++;
      showSection (currentSection);
      $('.nav-previous').removeClass ('disabled');
      
      //Enable a specific section the first time the user navigates to it
      $('#nav-' + sections[currentSection]).removeClass ('disabled');
      
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
      currentSection--;
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
      if (sections[targetSection] == clicked) break;
    }
    
    if (targetSection == currentSection) return;
    
    hideSection (currentSection);
    currentSection = targetSection;
    showSection (currentSection);
  });
})();
