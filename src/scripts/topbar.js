/**
 * Constructor function.
 */
class TopBar extends H5P.EventDispatcher {
  constructor(contentId, totalChapters, parent) {
    super();
    this.id = contentId;
    this.parent = parent;
    this.div = document.createElement('div');
    this.div.classList.add('sticky');
    this.navlist = document.createElement('ul');
    this.div.id = 'topbar';
    this.totalChapters = totalChapters;

    
    this.status = this.addStatus();
    this.menu = this.addMenu();
    
    this.navlist.appendChild(this.menu);
    this.addIcon('fa-search');
    
    this.navlist.appendChild(this.status);
    this.addIcon('fa-arrow-left');
    this.addIcon('fa-arrow-right');
    
    
    this.div.appendChild(this.navlist);
    this.parent.on('updateChapter', () =>{
      //TODO: Change only the active chapter, 
      this.status.innerHTML = 'Chapter ' + (this.parent.activeChapter+1) + ' of ' + this.totalChapters;
    });
  }

  addMenu() {
    let that = this;
    let row = document.createElement('li');
    let icon = document.createElement('button');
    icon.classList.add('fa', 'fa-bars');
    icon.onclick = function () {
      that.trigger('toggleMenu');
    };

    row.appendChild(icon);
    return row;
  }

  addStatus() {
    let newbutton = document.createElement('li');

    newbutton.innerHTML = 'Chapter ' + (this.parent.activeChapter+1) + ' of ' + this.totalChapters;
    return newbutton;
  }

  /**
   * Add a row to the top bar
   * @param {string} input 
   */
  addRow(input) {
    let newbutton = document.createElement('li');
    newbutton.innerHTML = input;
    return newbutton;
  }
  /**
   * Helper function to add icons
   * @param {string} iconcode 
   */
  addIcon(iconcode) {
    let row = document.createElement('li');
    let newbutton = document.createElement('a');
    newbutton.classList.add('fa', iconcode);

    row.appendChild(newbutton);
    this.navlist.appendChild(row);
  }
}
export default TopBar;