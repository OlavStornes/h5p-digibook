/**
 * Constructor function.
 */
class NavBar extends H5P.EventDispatcher {
  constructor(elemArray, contentId) {
    super();
    this.id = contentId;
    this.div = document.createElement('div');
    this.para = document.createElement('p');
    this.div.id = 'navbar';
    
    this.div.appendChild(this.parseElems(elemArray));  
  }

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

  //Parse element array to a more readable format
  parseElems(elemArray) {
    let ulElem = document.createElement('ul');
    let liElem, aElem;

    elemArray.forEach(elem => {
      
      liElem = document.createElement('li');
      aElem = document.createElement('button');

      aElem.innerHTML = this.parseLibrary(elem);
      aElem.onclick = function() {
        document.getElementById(elem.subContentId).focus();
      };
      liElem.appendChild(aElem);
      ulElem.appendChild(liElem);  
    });
    return ulElem;
  }
}
export default NavBar;