/**
 * Constructor function.
 */
class StatusBar extends H5P.EventDispatcher {
  constructor(contentId, totalChapters, parent) {
    super();
    this.id = contentId;
    this.parent = parent;
    this.totalChapters = totalChapters;

    this.top = document.createElement('div');
    this.top.classList.add('h5p-digibook-status', 'h5p-digibook-top');
    this.topNavList = document.createElement('ul');
    this.top.appendChild(this.topNavList);

    this.bot = document.createElement('div');
    this.bot.classList.add('h5p-digibook-status', 'h5p-digibook-bot');
    this.botNavList = document.createElement('ul');
    this.bot.appendChild(this.botNavList);
    
    //// this.addIcon('fa-search');
    
    this.topStatus = this.addStatus();
    this.botStatus = this.addStatus();
    this.topMenu = this.addMenu();
    this.botMenu = this.addMenu();
    this.topArrows = this.addArrows('top');
    this.botArrows = this.addArrows('bot');

    
    this.topNavList.appendChild(this.topMenu);
    this.topNavList.appendChild(this.topStatus);
    this.topNavList.appendChild(this.topArrows);

    this.botNavList.appendChild(this.botStatus);
    this.botNavList.appendChild(this.botArrows);



    this.on('updateStatusBar', () =>{
      //TODO: Change only the active chapter, 
      
      this.topStatus.innerHTML = 'Chapter ' + (this.parent.activeChapter+1) + ' of ' + this.totalChapters;
      //assure that the buttons are valid in terms of chapter edges
      if (this.parent.activeChapter <= 0) {
        this.topPrev.disabled = true;
        this.botPrev.disabled = true;

      }
      else {
        this.topPrev.disabled = false;
        this.botPrev.disabled = false;

      }

      if ((this.parent.activeChapter+1) >= this.totalChapters) {
        this.topNext.disabled = true;
        this.botNext.disabled = true;

      }
      else {
        this.topNext.disabled = false;
        this.botNext.disabled = false;

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


  addArrows(direction) {
    let that = this;
    let row = document.createElement('li');

    if (direction=='top') {
      this.topPrev = document.createElement('button');
      this.topNext = document.createElement('button');
      this.topPrev.innerHTML = "Previous";
      this.topNext.innerHTML = "Next";
      this.topPrev.onclick = function () {
        that.trigger('seqChapter', 'prev');
      };
      this.topNext.onclick = function () {
        that.trigger('seqChapter', 'next');
      };
      
      row.appendChild(this.topPrev);
      row.appendChild(this.topNext);
    }

    else if (direction == 'bot') {
      this.botPrev = document.createElement('button');
      this.botNext = document.createElement('button');
      this.botPrev.innerHTML = "Previous";
      this.botNext.innerHTML = "Next";
      this.botPrev.onclick = function () {
        that.trigger('seqChapter', 'prev');
      };
      this.botNext.onclick = function () {
        that.trigger('seqChapter', 'next');
      };
      
      row.appendChild(this.botPrev);
      row.appendChild(this.botNext);
    }

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
    this.topNavList.appendChild(row);
  }
}
export default StatusBar;