class Game{
    // Multiple games per browser are possible to implement quite easily
    constructor(){
        this.initVariables();
        this.bindEditorButtons();
        this.bindKeys();
        this.initTooltips();
        //$("input").on("keydown", defocusOnEsc); // bad way of implementing this
    }
    handleKeyPresses(event){
        if (event.key==="Escape"){
            // remove focus from everything when exc is pressed
            // this enables other keyboard shortcuts to work
            $("*").blur();
        }

        if (this.noActiveInputs()) {
            // Check if keys 0-9 is pressed and if game is running
            if (this.cardkeys.includes(event.key) && this.currentTeamId !== undefined) {
                let i = (parseInt(event.key) + 9) % 10;
                this.currentSong.revealNthCard(i);

            } else if (event.key==="T") { // hotkey to focus team editor
                setTimeout(("#team-name").focus(),1);
            } else if (event.key==="S") { // hotkey to focus song editor
                setTimeout($("#song-name").focus(),1);

            } else { // Handle other hotkeys
                //for (var i in this.shortcuts){
                for (var i = 0; i < this.shortcuts.length; i++){
                    if (event.key === this.shortcuts[i].key){
                        this.shortcuts[i].button.click();
                    }
                }
            }
        } else if (event.key==="Enter"){
            // focus and click next element after input on enter
            $("input[type=text][tabindex='1']:focus").next().focus().click();
        }

    }
    noActiveInputs(){
        return $("input[type=text]:focus").length === 0;
    }
    bindKeys(){
        $("body").on("keydown",this.handleKeyPresses.bind(this));
    }
    bindKeysForSecondWindow(){
        $("body", this.gameWindow.document).on("keydown",this.handleKeyPresses.bind(this));
    }
    initVariables(){
        this.setup = {};
        this.setup.$teamListing = $("#team-listing");
        this.setup.$songListing = $("#song-listing");
        this.$gameArea = $("#game-area");
        this.$songWrapper = $("#song-wrapper");
        this.songs =  [];
        this.teams = [];
        this.buttons = {};
        this.buttons.$addTeam = $("#add-team");
        this.buttons.$addSong = $("#add-song");
        this.buttons.$startGame = $("#game-start");
        this.buttons.$correctSong = $("#song-correct");
        this.buttons.$nextTeam = $("#nextTeam");
        this.buttons.$newTry = $("#newTry");
        this.$timer = $("#timer");
        this.shortcuts = [
            {key:"s", button:this.buttons.$startGame},
            {key:"c", button:this.buttons.$correctSong},
            {key:"w", button:this.buttons.$nextTeam},
            {key:"n", button:this.buttons.$newTry}
        ];
        this.cardkeys = ["1","2","3","4","5","6","7","8","9","0"];
    }
    initTooltips(){
        //for (var i in this.shortcuts){
        for (var i = 0; i < this.shortcuts.length; i++){
            this.shortcuts[i].button.attr("title", "Hotkey: " + this.shortcuts[i].key);
        }
    }
    bindEditorButtons(){
        this.buttons.$addTeam.click(this.getNewTeam.bind(this));
        this.buttons.$addSong.click(this.getNewSong.bind(this));
        this.buttons.$startGame.click(this.startGame.bind(this));
    }
    /* THIS WILL BE CALLED ONLY AFTER GAME STARTS! */
    bindGMButtons(){
        this.buttons.$correctSong.click(this.songCorrect.bind(this));
        this.buttons.$nextTeam.click(this.nextTeam.bind(this));
        this.buttons.$newTry.click(this.newTry.bind(this));

    }
    addTeam(team){
        this.teams.push(team);
    }
    addSong(song){
        this.songs.push(song);
    }
    removeSong(song){
        this.songs.splice(this.songs.indexOf(song),1);
    }
    removeTeam(team){
        this.teams.splice(this.teams.indexOf(team),1);
    }
    getNewTeam(){
        var $teamName = $("#team-name");
        this.addTeam(new Team($teamName.val(),rndColor(),this));
        $teamName.val(""); // wipe input field clear
        $teamName.focus();
    }
    getNewSong(){
        var $sName = $("#song-name");
        var sName = $sName.val();
        $sName.val("");
        var $sLyrics = $("#song-lyrics");
        var sLyrics = $sLyrics.val();
        $sLyrics.val("");
        this.addSong(new Song(sName, sLyrics, this));
        $sName.focus();
    }
    startGame(){
        // TODO: add real settings
        // TODO: hide songs on game start
        // TODO: add button to reveal songs
        this.settings = {
            timeToSing: 30,
            limitTTS: true,
            hardTTS: false,
            trapsPerLevel: 0,
            // TODO: implement traps
            timeToOpenFirst: 15,
            limitTTOF: false,
            hardTTOF: false,
            collapseSongsOnGameStart: true,
            gameInNewWindow: true,
            showWordCounter: false
        };
        if (this.songs.length > 0 && this.teams.length > 0){
            this.currentSongId = 0;
            this.currentTeamId = 0;
            this.currentSong.placeInPlayArea();

        } else {
            alert("Game can't be started without a team or song.");
            return
        }
        if (this.settings.gameInNewWindow){
            let win = $(window);
            let w = Math.floor(win.width()*0.8);
            let h = Math.floor(win.height()*0.8);
            this.gameWindow = window.open("","game-window","width="+w+",height="+h);
            win.on("unload",function(){this.gameWindow.close()}.bind(this));
            let cssLink = $("link[type='text/css']").clone();
            let relPath = cssLink.attr("href");
            cssLink.attr("href",makeAbsolutePath(relPath)); // WORKS ONLY WITH ONE STYLESHEET
            let head = $("head",this.gameWindow.document);
            head.append(cssLink);
            head.append("<title>The actual game</title>");
            this.$gameArea.detach(); // detach preserves variable references
            $("body",this.gameWindow.document).append(this.$gameArea);
            this.bindKeysForSecondWindow();
        }
        this.buttons.$startGame.off("click")
            .on("click",this.endGame.bind(this))
            .text("End game");
        // swap hotkey on game start to match new text on button
        this.shortcuts.find(c=>c.button===this.buttons.$startGame).key = "e";
        this.initTooltips(); // Update tooltip for new hotkey
        this.bindGMButtons();
        this.currentTeam.startTurn();

    }

    get currentTeam(){
        return this.teams[this.currentTeamId];
    }
    get currentSong(){
        return this.songs[this.currentSongId];
    }
    nextTeam(){
        this.currentTeam.endTurn();
        this.rotateCurrentTeam();
        this.currentTeam.startTurn();
        this.stopTimerUpdate();
    }
    rotateCurrentTeam(){
        this.currentTeamId = (this.currentTeamId+1)%this.teams.length;
    }
    nextSong(){
        this.currentSong.vanish();
        this.currentSongId = this.songs.findIndex(song=>song.isGuessed===false);
        if (this.currentSongId === -1){
            this.endGame()
        } else {
            this.currentSong.placeInPlayArea();
        }
        this.stopTimerUpdate();
    }
    endGame(){
        // TODO: impement endGame()
        // clear window
        // highlight scoreboard
        // prompt for new game
    }
    placeTeamsInScoreboard() {
        this.teams.forEach(team => team.placeInScoreboard());
    }

    songCorrect(){
        this.currentTeam.right();
        this.currentSong.guessed();
        this.nextSong();
    }
    newTry(){

    }

    resetTimer(ms){
        // ms optional. If not specified, seconds in settings will be used
        if (this.refreshTimerID !== undefined){
            this.stopTimerUpdate();
        }
        if (ms===undefined){
            ms = 1000*this.settings.timeToSing;
        }
        this.timerTime = new Date(new Date().getTime() + ms);
        this.refreshTimerID = setInterval(this.updateTimer.bind(this),20);
        // TODO: make timer update more reasonalbe

    }

    stopTimerUpdate(makeDashes){
        clearInterval(this.refreshTimerID);
        this.refreshTimerID = undefined;
        if (makeDashes !== undefined || makeDashes){
            this.$timer.text("--:--");
        }
    }
    toggleTimerFreeze(){
        if (this.timerFrosenMs===undefined){
            this.stopTimerUpdate(false);
            this.timerFrosenMs = this.timerTime - new Date();
        } else {
            this.resetTimer(this.timerFrosenMs);
        }
    }

    updateTimer(){
        var left = this.timerTime - new Date();
        if (left<=0){
            this.stopTimerUpdate();
            this.$timer.addClass("times-up");
            this.$timer.text("0.0s");

            // TODO: make nice css for timer when time's up
        } else {
            var mins = Math.floor(left/(1000*60));
            var secs = Math.floor((left-mins*1000*60)/1000);

            if (mins === 0 && secs < 10){
                var parts = Math.floor((left-secs*1000)/100);
                if (secs%2===1){ // TODO: add css to timer based on attribute [low]
                    this.$timer.attr("low", "odd");
                } else {
                    this.$timer.attr("low", "even");
                }
                this.$timer.text(secs+"."+parts+"s");
            } else {
                // if (String(secs).length == 1){secs = "0"+secs}
                this.$timer.text(mins+":"+secs+"");
            }
        }
    }
    cardRevealed(){
        this.resetTimer();
    }
    gotTrapped(){
        this.nextTeam();
    }

}


class Team{
    constructor(name, color, parentGame){
        this.name = name;
        this.color = color;
        this.wonSongs = [];
        this.parentGame = parentGame;
        this.placeInScoreboard();
        this.placeInEditor();
    }
    get points(){
        return this.wonSongs.length;
    }
    right(){
        this.wonSongs.push(this.parentGame.currentSong);
        this.updateScore();
    }
    placeInEditor(){
        this.$team = $($("#team-template").html());
        this.parentGame.setup.$teamListing.append(this.$team);
        this.$team.find(".team-name").val(this.name);
        // Taking team colours out for now. Maybe not a necessary feature
     /* var indicator = this.$team.find(".color-indicator");
        indicator.text(this.color);
        indicator.css('background',this.color);
        /* if (isColorDark(this.color)){
            indicator.addClass("dark");
        } else {
            indicator.addClass("light");
        }
        */
        this.$team.find("input.team-name").on("keyup change",this.updateTeamName.bind(this));
        this.$team.find(".remove-team-button").on("click",this.removeSelf.bind(this));

    }
    removeSelf(){
        this.$team.remove();
        this.parentGame.removeTeam(this);
    }
    updateTeamName(event){
        setTimeout(function(){
            this.name = this.$team.find("input.team-name").val();
            this.$score.find(".name").text(this.name);
        }.bind(this));
    }
    placeInScoreboard(){
        this.$score = $($("#team-score-template").html());
        this.$score.find(".name").text(this.name);
        this.$score.find(".points").text(this.points);
        this.parentGame.$gameArea.find("#scoreboard").append(this.$score);
    }
    updateScore(){
        this.$score.find(".points").text(this.points);
    }
    startTurn(){
        this.$score.addClass("active");
    }
    endTurn(){
        this.$score.removeClass("active");
    }

}

function isColorDark(bg){
    // https://stackoverflow.com/a/13558570
    // more accurate version for this
    var r, g, b;
    if (bg.length === 7) {
        r = parseInt(bg.slice(1, 3),16);
        g = parseInt(bg.slice(3, 5),16);
        b = parseInt(bg.slice(5, 7),16);
    } else if (bg.length === 4){
        r = parseInt(bg[1],16)*15;
        g = parseInt(bg[2],16)*15;
        b = parseInt(bg[3],16)*15;
    } else {
        console.log("Invalid color given to isColorDark.")
    }
    return euc(r,g,b)<0.6;
}
function euc(r,g,b){
    return (r**2+g**2+b**2)**0.5/441.6729559300637;
}

class Song{
    constructor(name, lyrics, parentGame){
        this.name = name;
        this.lyrics = lyrics;
        this.parentGame = parentGame;
        this.wordList = this.getParsedLyrics();
        this.gameCards = [];
        this.addCardToEditor();
        this.isGuessed = false;
    }
    guessed(){
        this.isGuessed = true;
    }
    addCardToEditor(){
        this.$editSong = $($("#edit-song-template").html());
        this.parentGame.setup.$songListing.append(this.$editSong);
        //this.updateCounterVisibility();
        this.$editSong.find(".edit-song-title").val(this.name);
        this.$editSong.find(".edit-lyrics").val(this.lyrics);
        this.updateEditorCounter();
        // this needs to be instant, hence keydown. Keyup isn't instant but doesn't require setTimeout
        this.$editSong.find(".edit-lyrics").on("keydown change", this.updateLyrics.bind(this));
        this.$editSong.find(".edit-song-title").on("keyup change", this.updateTitle.bind(this));
        this.$editSong.find(".remove-song-button").on("click",this.removeSelf.bind(this));
    }
    updateCounterVisibility(){
        if (!this.parentGame.settings.showWordCounter){
            this.$editSong.addClass("hide-counter");
        } else {
            this.$editSong.removeClass("hide-counter");
        }
    }
    removeSelf(){
        this.$editSong.remove();
        this.parentGame.removeSong(this);
    }
    placeInPlayArea(){
        this.gameCards =[];
        for (var i=0;i<this.wordList.length;++i){
            this.gameCards.push(new GameCard(this.wordList[i], i+1, this));
        }
    }
    vanish(){
        this.gameCards.forEach(card=>card.$card.remove());
        this.gameCards = [];
    }
    updateEditorCounter(){
        this.wordList = this.getParsedLyrics();
        this.$editSong.find(".n").text(this.wordList.length);
    }
    getParsedLyrics(){
        // Shy will break words with a hyphen when needed
        return this.lyrics.replace(".","&shy;").split(" ").filter(word => word !== "");
    }
    updateLyrics(){
        // set timeout 0 is required
        setTimeout(function(){
            this.lyrics = this.$editSong.find(".edit-lyrics").val();
            this.updateEditorCounter();
        }.bind(this),0);

    }
    updateTitle(){
        this.name = this.$editSong.find(".edit-song-title").val();
    }
    revealNthCard(n){
        this.gameCards[n].reveal();
    }
}

class GameCard{
    constructor(word, n, parentSong){
        this.word = word;
        this.n = n;
        this.$card = $($("#card-template").html());
        this.parentSong = parentSong;
        this.parentSong.parentGame.$songWrapper.append(this.$card);
        this.$card.find(".number").text(this.n);
        this.$card.find(".word").text(this.word);
        this.$card.click(this.reveal.bind(this));
        this.isTrap = false;
    }
    reveal(){
        this.$card.addClass("revealed");
        this.parentSong.parentGame.cardRevealed();
        if (this.isTrap){
            this.parentSong.parentGame.gotTrapped();
            this.$card.addClass("trap");
        }
    }
    makeTrap(){
        this.isTrap = true;
    }
}

/*
function defocusOnEsc(event){
    if (event.keyCode===27){
        this.blur();
    }
}*/

function rndColor(){ // this actually won't generate white but that's ok
    var n = Math.floor(Math.random()*0xffffff).toString(16);
    return "#"+"0".repeat(6-n.length)+n;
}

function makeAbsolutePath(relative){
    var pn = window.location.pathname;
    var folder = pn.slice(0,pn.lastIndexOf("/")+1);
    var href = window.location.href;
    var queries;
    if (href.indexOf("?")!==-1){
        queries = href.slice(href.indexOf("?"));
    } else {
        queries = "";
    }
    return window.location.origin + folder + relative + queries;
}

// from stack overflow
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

$(function(){
    game = new Game();
});
