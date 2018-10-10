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
    this.top.classList.add('h5p-digibook-status', 'h5p-digibook-status-header');

    this.topStatus = this.addProgress();
    this.botStatus = this.addProgress();
    this.topMenu = this.addMenu();
    this.buttonToTop = this.addToTop();
    
    this.topChapterTitle = this.addChapterTitle();
    this.botChapterTitle = this.addChapterTitle();

    
    const buttonTopPrev = document.createElement('div');
    const buttonTopNext = document.createElement('div');

    buttonTopPrev.appendChild(this.arrows.topPrev);
    buttonTopNext.appendChild(this.arrows.topNext);
    buttonTopPrev.classList.add('h5p-digibook-status-arrow', 'h5p-digibook-status-button');
    buttonTopNext.classList.add('h5p-digibook-status-arrow', 'h5p-digibook-status-button');


    this.top.appendChild(this.topMenu['div']);
    this.top.appendChild(this.topChapterTitle);
    this.top.appendChild(this.topStatus['div']);
    this.top.appendChild(buttonTopPrev);
    this.top.appendChild(buttonTopNext);

    

    /**
     * Bottom row initializer
     */
    this.bot = document.createElement('div');
    this.bot.classList.add('h5p-digibook-status', 'h5p-digibook-status-footer');
    
        
    const buttonBotPrev = document.createElement('div');
    const buttonBotNext = document.createElement('div');

    buttonBotPrev.appendChild(this.arrows.botPrev);
    buttonBotNext.appendChild(this.arrows.botNext);
    
    this.bot.appendChild(this.buttonToTop);
    this.bot.appendChild(this.botChapterTitle);
    this.bot.appendChild(this.botStatus['div']);
    this.bot.appendChild(buttonBotPrev);
    this.bot.appendChild(buttonBotNext);


    
    this.on('updateStatusBar', (this.updateStatusBar));

    /**
     * Sequential traversal of chapters
     * Event should be either 'next' or 'prev'
     */
    this.on('seqChapter', (event) => {
      let eventInput = {
        h5pbookid: this.parent.contentId
      };
      if (event.data.toTop) {
        eventInput.section = 0;
      }
      
      if (event.data.direction === 'next') {
        if (this.parent.activeChapter <= this.parent.columnElements.length) {
          eventInput.chapter = (this.parent.activeChapter+1);
        }
      }
      else if (event.data.direction === 'prev') {
        if (this.parent.activeChapter > 0) {
          eventInput.chapter = (this.parent.activeChapter-1);
        }
      }
      this.parent.trigger('newChapter', eventInput);
    });
  }

  updateStatusBar() {
    const status = (this.parent.activeChapter+1) ;
    
    const chapterTitle =  this.parent.instances[this.parent.activeChapter].title;

    this.topStatus['current'].innerHTML = status;
    this.botStatus['current'].innerHTML = status;

    
    this.topChapterTitle.firstChild.innerHTML = chapterTitle;
    this.botChapterTitle.firstChild.innerHTML = chapterTitle;
    
    this.topChapterTitle.setAttribute("title", chapterTitle);
    this.botChapterTitle.setAttribute("title", chapterTitle);

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
  }
  

  /**
   * Add traversal buttons for sequential travel (next and previous chapter)
   */
  addArrows() {
    const that = this;
    
    const acm = {};
    
    acm.topPrev = document.createElement('a');
    acm.topNext = document.createElement('a');
    acm.topPrev.classList.add('icon-previous');
    acm.topNext.classList.add('icon-next');
    acm.topPrev.onclick = function () {
      that.trigger('seqChapter', {
        direction:'prev',
        toTop: false
      });
    };
    acm.topNext.onclick = function () {
      that.trigger('seqChapter', {
        direction:'next',
        toTop: false
      });
    };
    
    
    acm.botPrev = document.createElement('a');
    
    acm.botNext = document.createElement('a');
    acm.botPrev.classList.add('h5p-digibook-status-button','icon-previous');
    acm.botNext.classList.add('h5p-digibook-status-button','icon-next');
    
    acm.botPrev.onclick = function () {
      that.trigger('seqChapter', {
        direction:'prev',
        toTop: true
      });
    };
    acm.botNext.onclick = function () {
      that.trigger('seqChapter', {
        direction:'next',
        toTop: true
      });
    };

    //Add tooltip
    acm.topNext.setAttribute("title", "Next page");
    acm.botNext.setAttribute("title", "Next page");
    acm.topPrev.setAttribute("title", "Previous page");
    acm.botPrev.setAttribute("title", "Previous page");

    return acm;
  }
  
  /**
   * Add a menu button which hides and shows the navigation bar
   */
  addMenu() {
    const that = this;
    const row = document.createElement('div');
    const item = document.createElement('a');
    // icon.innerHTML = "Toggle menu";
    item.classList.add('icon-menu');
    row.classList.add('h5p-digibook-status-menu', 'h5p-digibook-status-button');
    row.onclick = function () {
      that.parent.trigger('toggleMenu');
      this.classList.toggle('h5p-digibook-status-menu-active');
      item.classList.toggle('icon-menu');
      item.classList.toggle('icon-close');
      
    };
    
    row.appendChild(item);
    return {
      div:row,
      a:item
    };
  }

  toggleMenuIcon() {

  }

  /**
   * Add a paragraph which indicates which chapter is active 
   */
  addChapterTitle() {
    const row = document.createElement('div');
    const chapterTitle = document.createElement('p');
    row.classList.add('h5p-digibook-status-chapter');

    row.appendChild(chapterTitle);
    return row;

  }
  /**
   * Add a button which scrolls to the top of the page
   */
  addToTop() {
    const that = this;
    const row = document.createElement('div');
    const item = document.createElement('a');
    item.classList.add ('icon-up', 'h5p-digibook-status-button');
    item.setAttribute('title', 'Navigate to the top');
    item.onclick = function () {
      that.parent.trigger('scrollToTop');
    };
    row.appendChild(item);
    return row;
  }

  /**
   * Add a status-button which shows current and total chapters
   */
  addProgress() {
    const statusDiv = document.createElement('div');
    const statusElem = document.createElement('p');
    const current = document.createElement('span');
    const divider = document.createElement('span');
    const total = document.createElement('span');

    statusElem.classList.add('h5p-digibook-status-progress');

    current.classList.add('h5p-digibook-status-progress-number');
    divider.classList.add('h5p-digibook-status-progress-divider');
    total.classList.add('h5p-digibook-status-progress-number');

    divider.innerHTML = " / ";
    total.innerHTML = this.totalChapters;

    statusElem.appendChild(current);
    statusElem.appendChild(divider);
    statusElem.appendChild(total);

    statusDiv.appendChild(statusElem);
    return {
      div:statusDiv,
      current,
      total,
      divider,
      p:statusElem
    };
  }

  /**
   * Edit button state on both the top and bottom bar 
   * @param {bool} state 
   */
  editButtonStatus(target, state) {
    if (state) {
      this.arrows['top'+target].classList.add('disabled');
      this.arrows['bot'+target].classList.add('disabled');
    }
    else {
      this.arrows['top'+target].classList.remove('disabled');
      this.arrows['bot'+target].classList.remove('disabled');
    }
  }
}
export default StatusBar;