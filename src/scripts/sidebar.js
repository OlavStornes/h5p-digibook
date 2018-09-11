/**
 * Constructor function.
 */
class SideBar extends H5P.EventDispatcher {
  constructor(elemArray, contentId) {
    super();
    this.id = contentId;
    this.div = document.createElement('div');
    this.div.id = 'sidebar';
    
    this.div.appendChild(this.parseElems(elemArray, this));  
    this.activeChapter = null;

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
   * @param {array} elemArray 
   */
  parseElems(elemArray, parent) {
    let ulElem = document.createElement('ul');
    let liElem, aElem;
    var self = this;

    elemArray.forEach(elem => {
      
      liElem = document.createElement('li');
      aElem = document.createElement('button');

      aElem.innerHTML = elem.chapter +'-' + elem.section +': ' + this.parseLibrary(elem);
      aElem.parent = parent;

      aElem.onclick = function() {
        let tmp = document.getElementById('h5p-chapter-' + elem.chapter);
        
        if (tmp.style.display === 'none'){
          tmp.style.display = 'block';
        }
        
        // Workaround to make resizing function as intended
        setTimeout( ()=>{
          self.trigger('resize');
        }
        , 0);

        this.parent.activeChapter = elem.chapter;
        
      };
      liElem.appendChild(aElem);
      ulElem.appendChild(liElem);  
    });

    return ulElem;
  }
}
export default SideBar;