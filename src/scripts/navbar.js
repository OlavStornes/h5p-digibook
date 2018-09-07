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
    
    
    this.para.innerHTML = this.parseElems(elemArray);
    this.div.appendChild(this.para);  
  }
  
  //Parse element array to a more readable format
  parseElems(elemArray) {
    let navHTML = '';

    for (let i = 0; i < elemArray.length; i++) {
      //Splitting both on dots and spaces for a more sane output
      //TODO: apply lists in js instead
      navHTML += "- " + elemArray[i].library.split('.')[1].split(' ')[0] + '<br>';
    }

    return navHTML;
  }
  
}
export default NavBar;