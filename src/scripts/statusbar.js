/**
 * Constructor function.
 */
class StatusBar extends H5P.EventDispatcher {
  constructor(contentId, totalChapters, parent) {
    super();
    this.id = contentId;
    this.parent = parent;
    this.totalChapters = totalChapters;
    this.arrows = this.addArrows();
    let button0, button1;

    /**
     * Top row initializer
     */
    this.top = document.createElement('div');
    this.top.classList.add('h5p-digibook-status', 'h5p-digibook-header');
    this.topNavList = document.createElement('ul');
    this.top.appendChild(this.topNavList);

    this.topStatus = this.addStatus();
    this.botStatus = this.addStatus();
    this.topMenu = this.addMenu();
    this.buttonToTop = this.addToTop();
    
    button0 = document.createElement('li');
    button1 = document.createElement('li');

    button0.appendChild(this.arrows.topPrev);
    button1.appendChild(this.arrows.topNext);

    this.topNavList.appendChild(this.topMenu);
    this.topNavList.appendChild(this.topStatus);
    this.topNavList.appendChild(button0);
    this.topNavList.appendChild(button1);

    

    /**
     * Bottom row initializer
     */
    this.bot = document.createElement('div');
    this.bot.classList.add('h5p-digibook-status', 'h5p-digibook-footer');
    this.botNavList = document.createElement('ul');
    this.bot.appendChild(this.botNavList);
    
        
    button0 = document.createElement('li');
    button1 = document.createElement('li');

    button0.appendChild(this.arrows.botPrev);
    button1.appendChild(this.arrows.botNext);
    
    this.botNavList.appendChild(this.buttonToTop);
    this.botNavList.appendChild(this.botStatus);
    this.botNavList.appendChild(button0);

    
    this.on('updateStatusBar', () =>{
      //TODO: Change only the active chapter, 
      
      this.topStatus.innerHTML = 'Chapter ' + (this.parent.activeChapter+1) + ' of ' + this.totalChapters;
      //assure that the buttons are valid in terms of chapter edges
      if (this.parent.activeChapter <= 0) {
        this.editButtonStatus('Prev', true);
      }
      else {
        this.editButtonStatus('Prev', false);
      }
      if ((this.parent.activeChapter+1) >= this.totalChapters) {
        this.editButtonStatus('Next', true);
      }
      else {
        this.editButtonStatus('Next', false);
      }
    });

    /**
     * Sequential traversal of chapters
     * Event should be either 'next' or 'prev'
     */
    this.on('seqChapter', (event) => {
      let eventInput = {section:0};
      if (event.data === 'next') {
        if (this.parent.activeChapter <= this.parent.columnElements.length) {
          eventInput.chapter = (this.parent.activeChapter+1);
        }
      }
      else if (event.data === 'prev') {
        if (this.parent.activeChapter > 0) {
          eventInput.chapter = (this.parent.activeChapter-1);
        }
      }
      this.parent.trigger('newChapter', eventInput);
    });
  }

  /**
   * Add traversal buttons for sequential travel (next and previous chapter)
   */
  addArrows() {
    let that = this;
    
    let acm = {};
    
    acm.topPrev = document.createElement('button');
    acm.topNext = document.createElement('button');
    acm.topPrev.innerHTML = "Previous";
    acm.topNext.innerHTML = "Next";
    acm.topPrev.onclick = function () {
      that.trigger('seqChapter', 'prev');
    };
    acm.topNext.onclick = function () {
      that.trigger('seqChapter', 'next');
    };
    
    
    acm.botPrev = document.createElement('button');
    acm.botNext = document.createElement('button');
    acm.botPrev.innerHTML = "Previous";
    acm.botNext.innerHTML = "Next";
    
    acm.botPrev.onclick = function () {
      that.trigger('seqChapter', 'prev');
    };
    acm.botNext.onclick = function () {
      that.trigger('seqChapter', 'next');
    };
    

    return acm;
  }
  
  /**
   * Add a menu button which hides and shows the navigation bar
   */
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
  /**
   * Add a button which scrolls to the top of the page
   */
  addToTop() {
    let that = this;
    let row = document.createElement('li');
    let icon = document.createElement('button');
    icon.innerHTML = "Scroll to top";
    icon.onclick = function () {
      that.parent.trigger('scrollToTop');
    };
    row.appendChild(icon);
    return row;
  }

  /**
   * Add a status-button which shows current and total chapters
   */
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
    this.topNavList.appendChild(row);
  }

  /**
   * Edit button state on both the top and bottom bar 
   * @param {bool} state 
   */
  editButtonStatus(target, state) {
    this.arrows['top'+target].disabled = state;
    this.arrows['bot'+target].disabled = state;
  }
}
export default StatusBar;