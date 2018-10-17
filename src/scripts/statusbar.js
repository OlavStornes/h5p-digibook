/**
 * Constructor function.
 */
class StatusBar extends H5P.EventDispatcher {
  constructor(contentId, totalChapters, parent, params) {
    super();
    this.id = contentId;
    this.parent = parent;

    this.params = this.extend(
      {
        l10n: {
          nextPage: 'Next page',
          previousPage: 'Previous page',
          navigateToTop: 'Navigate to the top',
          markAsFinished: 'I have finished this page'
        }
      },
      params || {}
    );

    this.totalChapters = totalChapters;
    this.arrows = this.addArrows();

    /**
     * Top row initializer
     */
    this.top = document.createElement('div');
    this.topInfo = document.createElement('div');
    this.topInfo.classList.add('h5p-digibook-status', 'h5p-digibook-status-header');
    
    this.topProgressBar = this.addProgressBar();
    this.topStatus = this.addProgress(false);
    this.botStatus = this.addProgress(true);
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

    this.top.appendChild(this.topProgressBar.div);
    this.topInfo.appendChild(this.topMenu.div);
    this.topInfo.appendChild(this.topChapterTitle.div);
    this.topInfo.appendChild(this.topStatus.div);
    this.topInfo.appendChild(buttonTopPrev);
    this.topInfo.appendChild(buttonTopNext);
    this.top.appendChild(this.topInfo);

    

    /**
     * Bottom row initializer
     */
    this.bot = document.createElement('div');
    this.botInfo = document.createElement('div');
    this.botInfo.classList.add('h5p-digibook-status', 'h5p-digibook-status-footer');
    
    this.botProgressBar = this.addProgressBar();    
    const buttonBotPrev = document.createElement('div');
    const buttonBotNext = document.createElement('div');

    buttonBotPrev.appendChild(this.arrows.botPrev);
    buttonBotNext.appendChild(this.arrows.botNext);
    buttonBotPrev.classList.add('h5p-digibook-status-arrow', 'h5p-digibook-status-button');
    buttonBotNext.classList.add('h5p-digibook-status-arrow', 'h5p-digibook-status-button');
    
    this.bot.appendChild(this.botProgressBar.div);
    this.botInfo.appendChild(this.buttonToTop.div);
    this.botInfo.appendChild(this.botChapterTitle.div);
    this.botInfo.appendChild(this.botStatus.div);
    this.botInfo.appendChild(buttonBotPrev);
    this.botInfo.appendChild(buttonBotNext);

    this.bot.appendChild(this.botInfo);



    
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

  updateProgressBar(chapter) {
    let barWidth = ((chapter / this.totalChapters)*100)+"%";

    this.topProgressBar.progress.style.width = barWidth;
  }

  updateReadMarker() {
    const isDone = this.parent.isCurrentChapterRead();
    this.checkMark.markRead.disabled = isDone;
    this.checkMark.markRead.checked = isDone;
  }

  updateStatusBar() {
    const currChapter = (this.parent.activeChapter+1) ;
    
    const chapterTitle =  this.parent.instances[this.parent.activeChapter].title;

    this.topStatus.current.innerHTML = currChapter;
    this.botStatus.current.innerHTML = currChapter;

    this.updateProgressBar(currChapter);

    
    this.topChapterTitle.p.innerHTML = chapterTitle;
    this.botChapterTitle.p.innerHTML = chapterTitle;
    
    this.topChapterTitle.p.setAttribute("title", chapterTitle);
    this.botChapterTitle.p.setAttribute("title", chapterTitle);

    if (this.params.behaviour.progressIndicators && !this.params.behaviour.progressAuto) {
      this.updateReadMarker();
    }

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
    acm.topNext.setAttribute("title", this.params.l10n.nextPage);
    acm.botNext.setAttribute("title", this.params.l10n.nextPage);
    acm.topPrev.setAttribute("title", this.params.l10n.previousPage);
    acm.botPrev.setAttribute("title", this.params.l10n.previousPage);

    return acm;
  }
  
  /**
   * Add a menu button which hides and shows the navigation bar
   */
  addMenu() {
    const that = this;
    const row = document.createElement('div');
    const item = document.createElement('a');

    let iconType = 'icon-menu';
    if (this.params.behaviour.defaultTableOfContents) {
      iconType = 'icon-close';
      row.classList.add('h5p-digibook-status-menu-active');
    }
    item.classList.add(iconType);

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

  addProgressBar() {
    const div = document.createElement('div');
    const progress = document.createElement('div');

    div.classList.add('h5p-digibook-status-progressbar-back');
    progress.classList.add('h5p-digibook-status-progressbar-front');

    div.appendChild(progress);

    return {
      div,
      progress
    };
  }

  /**
   * Add a paragraph which indicates which chapter is active 
   */
  addChapterTitle() {
    const div = document.createElement('div');
    const chapterTitle = document.createElement('p');
    div.classList.add('h5p-digibook-status-chapter');

    div.appendChild(chapterTitle);
    return {
      div,
      p:chapterTitle
    };

  }
  /**
   * Add a button which scrolls to the top of the page
   */
  addToTop() {
    const that = this;
    const div = document.createElement('div');
    const a = document.createElement('a');
    div.classList.add('h5p-digibook-status-button', 'h5p-digibook-status-arrow');
    a.classList.add ('icon-up');
    a.setAttribute('title', this.params.l10n.navigateToTop);
    a.onclick = function () {
      that.parent.trigger('scrollToTop');
    };
    div.appendChild(a);
    return {
      div,
      a
    };
  }

  addMarkAsReadButton() {
    const div = document.createElement('div');
    const checkText = document.createElement('p');
    checkText.innerHTML = this.params.l10n.markAsFinished + " :";

    const markRead = document.createElement('input');
    markRead.setAttribute('type', 'checkbox');
    markRead.classList.add('h5p-digibook-status-progress-marker');
    markRead.onclick = () => {
      this.parent.setCurrentChapterRead();
      markRead.disabled = true;
    };

    div.appendChild(checkText);
    div.appendChild(markRead);

    return {
      div,
      markRead,
      checkText
    };
  }

  /**
   * Add a status-button which shows current and total chapters
   */
  addProgress(footer) {
    const div = document.createElement('div');
    const p = document.createElement('p');
    const current = document.createElement('span');
    const divider = document.createElement('span');
    const total = document.createElement('span');

    p.classList.add('h5p-digibook-status-progress');

    current.classList.add('h5p-digibook-status-progress-number');
    divider.classList.add('h5p-digibook-status-progress-divider');
    total.classList.add('h5p-digibook-status-progress-number');

    divider.innerHTML = " / ";
    total.innerHTML = this.totalChapters;

    p.appendChild(current);
    p.appendChild(divider);
    p.appendChild(total);

    if (footer) {
      if (this.params.behaviour.progressIndicators && !this.params.behaviour.progressAuto) {
        this.checkMark = this.addMarkAsReadButton();
        div.appendChild(this.checkMark.div);
      }
    }

    
    div.appendChild(p);
    return {
      div,
      current,
      total,
      divider,
      p
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

  /**
   * Extend an array just like JQuery's extend.
   *
   * @param {object} arguments Objects to be merged.
   * @return {object} Merged objects.
   */
  extend() {
    for (let i = 1; i < arguments.length; i++) {
      for (let key in arguments[i]) {
        if (arguments[i].hasOwnProperty(key)) {
          if (typeof arguments[0][key] === 'object' && typeof arguments[i][key] === 'object') {
            this.extend(arguments[0][key], arguments[i][key]);
          }
          else {
            arguments[0][key] = arguments[i][key];
          }
        }
      }
    }
    return arguments[0];
  }
}
export default StatusBar;
