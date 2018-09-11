/**
 * Constructor function.
 */
class SideBar extends H5P.EventDispatcher {
  constructor(columnSections, contentId) {
    super();
    this.id = contentId;
    this.div = document.createElement('div');
    this.div.id = 'sidebar';
    
    this.div.appendChild(this.parseColumnContent(columnSections, this));  
    this.activeChapter = 0;

  }
  /**
   * Parses the library which is used
   * TODO: Implement a more flexible system for library/title detection
   * @param {string} input 
   */
  parseLibrary(input){
    let tmp;

    switch (input.library.split(" ")[0]) {
      case "H5P.AdvancedText":
      
        tmp = input.params.text.match(/<h2>(.+)<\/h2>/);
        if (tmp)
          tmp = tmp[1];
        else
          tmp = "Unnamed paragraph";
        break;
    
      case "H5P.Image":
        tmp = input.params.alt;
        break;
      default:
        tmp = input.library;
        break;
    }
    return tmp;

  }

  
  /**
   * Parse element array from app.js to a more readable format
   * @param {array} columnSections 
   */
  parseColumnContent(columnSections, parent) {
    let ulElem = document.createElement('ul');
    let liElem, aElem;
    var that = this;

    columnSections.forEach(section => {
      
      liElem = document.createElement('li');
      aElem = document.createElement('button');

      aElem.innerHTML = section.chapter +'-' + section.section +': ' + this.parseLibrary(section);
      aElem.parent = parent;

      aElem.onclick = function() {
        let newSection = document.getElementById('h5p-chapter-' + section.chapter);
        
        if (newSection.style.display === 'none'){
          document.getElementById('h5p-chapter-' + parent.activeChapter).style.display = 'none';
          newSection.style.display = 'block';
        }
        this.parent.activeChapter = section.chapter;
        
        // Send a resizing trigger upstream
        that.trigger('resize');
        
        
        // Workaround on focusing on new element
        setTimeout(function(){
          document.getElementById(section.subContentId).scrollIntoView();
        }, 0);
        
      };
      liElem.appendChild(aElem);
      ulElem.appendChild(liElem);  
    });

    return ulElem;
  }
}
export default SideBar;