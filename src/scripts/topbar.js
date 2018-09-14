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
    this.navList = document.createElement('ul');
    this.div.id = 'topbar';
    this.totalChapters = totalChapters;

    
    this.status = this.addStatus();
    this.menu = this.addMenu();
    this.prevChapter = this.addArrow('prev');
    this.nextChapter = this.addArrow('next');
    
    this.navList.appendChild(this.menu);
    this.addIcon('fa-search');
    
    this.navList.appendChild(this.status);
    this.navList.appendChild(this.prevChapter);
    this.navList.appendChild(this.nextChapter);

    
    this.div.appendChild(this.navList);
    this.parent.on('updateTopBar', () =>{
      //TODO: Change only the active chapter, 
      
      this.status.innerHTML = 'Chapter ' + (this.parent.activeChapter+1) + ' of ' + this.totalChapters;
      //assure that the buttons are valid in terms of chapter edges
      if (this.parent.activeChapter <= 0) {
        this.prevChapter.firstChild.disabled = true;
      }
      else {
        this.prevChapter.firstChild.disabled = false;
      }

      if ((this.parent.activeChapter+1) >= this.totalChapters) {
        this.nextChapter.firstChild.disabled = true;
      }
      else {
        this.nextChapter.firstChild.disabled = false;
      }
    });
  }
  addArrow(direction) {
    let that = this;
    let row = document.createElement('li');
    let icon = document.createElement('button');
    

    if (direction == 'prev') {
      icon.classList.add('fa', 'fa-arrow-left');
    }
    else if (direction == 'next') {
      icon.classList.add('fa', 'fa-arrow-right');      
    }

    icon.onclick = function () {
      that.trigger('seqChapter', direction);
    };

    row.appendChild(icon);
    return row;
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
    this.navList.appendChild(row);
  }
}
export default TopBar;