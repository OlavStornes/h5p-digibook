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
    this.botChapterTitle = this.addChapterTitle();

    
    const buttonTopPrev = document.createElement('li');
    const buttonTopNext = document.createElement('li');

    buttonTopPrev.appendChild(this.arrows.topPrev);
    buttonTopNext.appendChild(this.arrows.topNext);
    buttonTopPrev.classList.add('h5p-digibook-status-arrow');
    buttonTopNext.classList.add('h5p-digibook-status-arrow');


    this.topNavList.appendChild(this.topMenu);
    this.topNavList.appendChild(this.topChapterTitle);
    this.topNavList.appendChild(this.topStatus['li']);
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
    this.botNavList.appendChild(this.botChapterTitle);
    this.botNavList.appendChild(this.botStatus['li']);
    this.botNavList.appendChild(buttonBotPrev);
    this.botNavList.appendChild(buttonBotNext);


    
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
    //TODO: Change only the active chapter, 
    const status = (this.parent.activeChapter+1) + ' / ' + this.totalChapters;
    
    const chapterTitle =  this.parent.instances[this.parent.activeChapter].title;
    this.topStatus['p'].innerHTML = status;
    this.botStatus['p'].innerHTML = status;

    
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
    acm.topPrev.classList.add('asdf', 'icon-previous');
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
    acm.botPrev.classList.add('icon-previous');
    acm.botNext.classList.add('icon-next');
    
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
    const row = document.createElement('li');
    const item = document.createElement('a');
    // icon.innerHTML = "Toggle menu";
    item.classList.add('icon-menu');
    row.classList.add('h5p-digibook-status-menu');
    item.onclick = function () {
      that.parent.trigger('toggleMenu');
    };
    
    row.appendChild(item);
    return row;
  }

  /**
   * Add a paragraph which indicates which chapter is active 
   */
  addChapterTitle() {
    const row = document.createElement('li');
    const chapterTitle = document.createElement('p');
    chapterTitle.classList.add('h5p-digibook-status-chapter');

    row.appendChild(chapterTitle);
    return row;

  }
  /**
   * Add a button which scrolls to the top of the page
   */
  addToTop() {
    const that = this;
    const row = document.createElement('li');
    const item = document.createElement('a');
    item.classList.add ('icon-up');
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
  addStatus() {
    const statusLi = document.createElement('li');
    const statusElem = document.createElement('p');
    statusElem.classList.add('h5p-chapter-status');
    statusLi.appendChild(statusElem);
    return {
      li:statusLi,
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