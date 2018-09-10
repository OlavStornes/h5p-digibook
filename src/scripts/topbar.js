/**
 * Constructor function.
 */
class TopBar extends H5P.EventDispatcher {
  constructor(contentId) {
    super();
    this.id = contentId;
    this.div = document.createElement('div');
    this.navlist = document.createElement('ul');
    this.div.id = 'topbar';

    
    this.addIcon("fa-bars");
    this.addIcon("fa-search");

    this.addRow('Page % of %');
    this.addIcon('fa-arrow-right');
    this.addIcon('fa-arrow-left');

    
    this.div.appendChild(this.navlist);
  }

  
  //Add a row to the top bar
  addRow(input){
    let newbutton = document.createElement('li');
    newbutton.innerHTML = input;
    this.navlist.appendChild(newbutton);
  }
  // Helper function to add icons
  addIcon(iconcode){
    this.addRow('<i class="fa '+ iconcode + '"></i>');
  }
}
export default TopBar;