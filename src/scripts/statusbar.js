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
    
    this.topChapterTitle = this.addChapterTitle();
    
    const buttonTopPrev = document.createElement('li');
    const buttonTopNext = document.createElement('li');

    buttonTopPrev.appendChild(this.arrows.topPrev);
    buttonTopNext.appendChild(this.arrows.topNext);

    this.topNavList.appendChild(this.topMenu);
    this.topNavList.appendChild(this.topChapterTitle);
    this.topNavList.appendChild(this.topStatus);
    this.topNavList.appendChild(buttonTopPrev);
    this.topNavList.appendChild(buttonTopNext);

    

    /**
     * Bottom row initializer
     */
    this.bot = document.createElement('div');
    this.bot.classList.add('h5p-digibook-status', 'h5p-digibook-footer');
    this.botNavList = document.createElement('ul');
    this.bot.appendChild(this.botNavList);
    
        
    const buttonBotPrev = document.createElement('li');
    const buttonBotNext = document.createElement('li');

    buttonBotPrev.appendChild(this.arrows.botPrev);
    buttonBotNext.appendChild(this.arrows.botNext);
    
    this.botNavList.appendChild(this.buttonToTop);
    this.botNavList.appendChild(this.botStatus);
    this.botNavList.appendChild(buttonBotPrev);
    this.botNavList.appendChild(buttonBotNext);


    
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
    const that = this;
    
    const acm = {};
    
    acm.topPrev = document.createElement('span');
    acm.topNext = document.createElement('span');
    acm.topPrev.classList.add('fas', 'fa-angle-left', 'fa-4x', 'fa-fw');
    acm.topNext.classList.add('fas', 'fa-angle-right', 'fa-4x', 'fa-fw');
    acm.topPrev.onclick = function () {
      that.trigger('seqChapter', 'prev');
    };
    acm.topNext.onclick = function () {
      that.trigger('seqChapter', 'next');
    };
    
    
    acm.botPrev = document.createElement('span');
    acm.botNext = document.createElement('span');
    acm.botPrev.classList.add('fas', 'fa-angle-left', 'fa-4x');
    acm.botNext.classList.add('fas', 'fa-angle-right', 'fa-4x');
    
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
    const that = this;
    const row = document.createElement('li');
    const icon = document.createElement('span');
    // icon.innerHTML = "Toggle menu";
    icon.classList.add('fas', 'fa-bars', 'fa-2x');
    icon.onclick = function () {
      that.parent.trigger('toggleMenu');
    };
    
    row.appendChild(icon);
    return row;
  }

  addChapterTitle() {
    const row = document.createElement('li');
    const chapterTitle = document.createElement('p');

    this.on('updateStatusBar', () =>{
      chapterTitle.innerHTML = this.parent.instances[this.parent.activeChapter].title;
    });
    row.appendChild(chapterTitle);
    return row;

  }
  /**
   * Add a button which scrolls to the top of the page
   */
  addToTop() {
    const that = this;
    const row = document.createElement('li');
    const icon = document.createElement('button');
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
    const newbutton = document.createElement('li');
    newbutton.innerHTML = 'Chapter ' + (this.parent.activeChapter+1) + ' of ' + this.totalChapters;
    return newbutton;
  }

  /**
   * Helper function to add icons
   * @param {string} iconcode 
   */
  addIcon(iconcode) {
    const row = document.createElement('li');
    const newbutton = document.createElement('a');
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