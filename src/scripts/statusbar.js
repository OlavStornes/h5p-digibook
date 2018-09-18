/**
 * Constructor function.
 */
class StatusBar extends H5P.EventDispatcher {
  constructor(contentId, totalChapters, parent, placement) {
    super();
    this.id = contentId;
    this.parent = parent;
    this.div = document.createElement('div');
    this.div.classList.add('h5p-digibook-status', 'h5p-digibook-' + placement);
    this.navList = document.createElement('ul');
    this.totalChapters = totalChapters;

    
    this.status = this.addStatus();
    this.menu = this.addMenu();
    this.arrows = this.addArrows();
    
    this.navList.appendChild(this.menu);
    this.addIcon('fa-search');
    
    this.navList.appendChild(this.status);
    this.navList.appendChild(this.arrows);

    
    this.div.appendChild(this.navList);



    this.on('updateTopBar', () =>{
      //TODO: Change only the active chapter, 
      
      this.status.innerHTML = 'Chapter ' + (this.parent.activeChapter+1) + ' of ' + this.totalChapters;
      //assure that the buttons are valid in terms of chapter edges
      if (this.parent.activeChapter <= 0) {
        this.prev.disabled = true;
      }
      else {
        this.prev.disabled = false;
      }

      if ((this.parent.activeChapter+1) >= this.totalChapters) {
        this.next.disabled = true;
      }
      else {
        this.next.disabled = false;
      }
    });

    this.on('seqChapter', (event) => {

      let eventInput = {section:0};
      //Event should be either 'next' or 'prev'
      if (event.data === 'next') {
        //Codepath for traversing to next chapter
        if (this.parent.activeChapter <= this.parent.columnElements.length) {
          eventInput.chapter = (this.parent.activeChapter+1);
        }
      }
      else if (event.data === 'prev') {
        //traversing backwards
        if (this.parent.activeChapter > 0) {
          eventInput.chapter = (this.parent.activeChapter-1);
        }
      }
      this.parent.trigger('newChapter', eventInput);
    });
  }
  addArrows() {
    let that = this;
    let row = document.createElement('li');
    this.prev = document.createElement('button');
    this.next = document.createElement('button');

    

    this.prev.innerHTML = "Previous";

    this.next.innerHTML = "Next";

    this.prev.onclick = function () {
      that.trigger('seqChapter', 'prev');
    };
    this.next.onclick = function () {
      that.trigger('seqChapter', 'next');
    };

    row.appendChild(this.prev);
    row.appendChild(this.next);

    return row;
  }

  addMenu() {
    let that = this;
    let row = document.createElement('li');
    let icon = document.createElement('button');
    icon.innerHTML = "Toggle menu";
    icon.onclick = function () {
      that.parent.trigger('toggleMenu');
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
export default StatusBar;