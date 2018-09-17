/**
 * Constructor function.
 */
class SideBar extends H5P.EventDispatcher {
  constructor(columnSections, contentId, parent) {
    super();
    this.id = contentId;
    this.parent = parent;
    this.div = document.createElement('div');
    this.div.classList.add('sidebar');
    this.div.hidden = true;
    
    this.div.appendChild(this.parseColumnContent(columnSections, this));  

  }
  /**
   * Parses the library which is used
   * TODO: Implement a more flexible system for library/title detection
   * @param {string} input 
   */
  parseLibrary(input) {
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

      aElem.onclick = function () {
        
        // Send a trigger upstream
        that.parent.trigger('newChapter', section);
        
      };
      liElem.appendChild(aElem);
      ulElem.appendChild(liElem);  
    });

    return ulElem;
  }
}
export default SideBar;