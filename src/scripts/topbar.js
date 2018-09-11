/**
 * Constructor function.
 */
class TopBar extends H5P.EventDispatcher {
  constructor(contentId, totalChapters) {
    super();
    this.id = contentId;
    this.div = document.createElement('div');
    this.div.classList.add('sticky');
    this.navlist = document.createElement('ul');
    this.div.id = 'topbar';
    this.totalChapters = totalChapters;

    
    this.addIcon('fa-bars');
    this.addIcon('fa-search');

    this.addRow('Chapter % of ' + this.totalChapters);
    this.addIcon('fa-arrow-left');
    this.addIcon('fa-arrow-right');

    
    this.div.appendChild(this.navlist);
  }

  /**
   * Add a row to the top bar
   * @param {string} input 
   */
  addRow(input){
    let newbutton = document.createElement('li');
    newbutton.innerHTML = input;
    this.navlist.appendChild(newbutton);
  }
  /**
   * Helper function to add icons
   * @param {string} iconcode 
   */
  addIcon(iconcode){
    let row = document.createElement('li');
    let newbutton = document.createElement('a');
    newbutton.classList.add('fa', iconcode);

    row.appendChild(newbutton);
    this.navlist.appendChild(row);
  }
}
export default TopBar;