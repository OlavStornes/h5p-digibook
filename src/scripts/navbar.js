/**
 * Constructor function.
 */
class NavBar extends H5P.EventDispatcher {
  constructor(text, contentId) {
    super();
    this.text = text;
    this.id = contentId;
    this.div = document.createElement('div');
    this.div.id = 'navbar';
    this.para = document.createElement('p');
    

    // add the text node to the newly created div
    
    this.para.innerHTML = text;
    // console.log(newContent);

    this.div.appendChild(this.para);  
    
    this.addnav = function(input) {
      
      return input;
    };

  }
}
export default NavBar;