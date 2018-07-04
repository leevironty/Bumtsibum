class Game{
    // Multiple games per browser are possible to implement quite easily
    constructor(){
        this.initVariables();
        this.bindEditorButtons();
        this.bindKeys();
        $("input").on("keydown", defocusOnEsc);
    }
    handleKeyPresses(event){
        if (this.noActiveInputs()){

        }
    }
    noActiveInputs(){

    }
    bindKeys(){
        $("body").on("keydown",this.handleKeyPresses.bind(this))
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
    }
    bindEditorButtons(){
        this.buttons.$addTeam.click(this.getNewTeam.bind(this));
        this.buttons.$addSong.click(this.getNewSong.bind(this));
        this.buttons.$startGame.click(this.startGame.bind(this));
    }

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
        // TODO: initialise ui elements shown to players
        // TODO: make game controls for game master
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
            gameInNewWindow: true
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
            let w = Math.floor(win.width()*0.5);
            let h = Math.floor(win.height()*0.5);
            this.gameWindow = window.open("","game-window","width="+w+",height="+h);
            let cssLink = $("link[rel='stylesheet']").clone();
            let relPath = cssLink.attr("href");
            cssLink.attr("href",makeAbsolutePath(relPath)); // WORKS ONLY WITH ONE STYLESHEET
            $("head",this.gameWindow.document).append(cssLink);
            this.$gameArea.detach(); // detach preserves variable references
            $("body",this.gameWindow.document).append(this.$gameArea);
        }
        this.placeTeamsInScoreboard();
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
    resetTimer(){
        if (this.refreshTimerID !== undefined){
            this.stopTimerUpdate();
        }
        this.timerTime = new Date(new Date().getTime() + 1000*this.settings.timeToSing);
        this.refreshTimerID = setInterval(this.updateTimer.bind(this),20);

    }

    stopTimerUpdate(){
        clearInterval(this.refreshTimerID);
        this.refreshTimerID = undefined;
        this.$timer.text("--:--");
    }

    updateTimer(){
        var left = this.timerTime - new Date();
        if (left<=0){
            this.stopTimerUpdate();
            this.$timer.addClass("times-up");
            this.$timer.text("0.0s left");

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
                this.$timer.text(secs+"."+parts+"s left");
            } else {
                // if (String(secs).length == 1){secs = "0"+secs}
                this.$timer.text(mins+":"+secs+" left");
            }
        }
    }
    cardRevealed(){
        this.resetTimer();
    }

}


class Team{
    constructor(name, color, parentGame){
        this.name = name;
        this.color = color;
        this.wonSongs = [];
        this.parentGame = parentGame;
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
        this.$team.children(".team-name").text(this.name);
        var indicator = this.$team.children(".color-indicator");
        indicator.text(this.color);
        indicator.css('background',this.color);
        if (isColorDark(this.color)){
            indicator.addClass("dark");
        } else {
            indicator.addClass("light");
        }



        // TODO: make things editable. Turn fields into inputs with data synced to variables.
        // TODO: "remove team" -button
    }
    placeInScoreboard(){
        this.$score = $($("#team-score-template").html());
        this.$score.children(".name").text(this.name);
        this.$score.children(".points").text(this.points);
        this.parentGame.$gameArea.children("#scoreboard").append(this.$score);
    }
    updateScore(){
        this.$score.children(".points").text(this.points);
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
        this.$editSong.children(".edit-song-title").val(this.name);
        this.$editSong.children(".edit-lyrics").val(this.lyrics);
        this.updateEditorCounter();
        this.$editSong.children(".edit-lyrics").on("keydown change", this.updateLyrics.bind(this)); // this needs to be instant, hence keydown
        this.$editSong.children(".edit-song-title").on("keyup change", this.updateTitle.bind(this));
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
        // TODO: move html editing part of card making to a method
    }
    updateEditorCounter(){
        this.wordList = this.getParsedLyrics();
        this.$editSong.find(".n").text(this.wordList.length);
    }
    getParsedLyrics(){
        // TODO: replace with shy not tested
        // Shy will break words with a hyphen when needed
        return this.lyrics.replace(".","&shy;").split(" ").filter(word => word !== "");
    }
    updateLyrics(){
        // set timeout 0 is required
        setTimeout(function(){
            this.lyrics = this.$editSong.children(".edit-lyrics").val();
            this.updateEditorCounter();
        }.bind(this),0);

    }
    updateTitle(){
        this.name = this.$editSong.children(".edit-song-title").val();
    }
}

/* // Useless.
class EditCard{
    constructor(word,parentSong){
        // create html
        // place it in right place
        // bind all keypresses to trigger parent song lyricsd updater
        this.word = word;
        this.$card = $($("#edit-card-template").html());
        this.parentSong = parentSong;
        this.parentSong.$editCardArea.append(this.$card);
        this.$card.children(".edit-word").val(this.word);
        this.$card.children(".edit-word").on("keydown",this.updateLyrics.bind(this));
    }
    updateLyrics(){
        // Keep variable always equivalent to input field
        this.word = this.$card.children(".edit-word").val();
        this.parentSong.getNewLyrics();
    }
}
*/
class GameCard{
    constructor(word, n, parentSong){
        this.word = word;
        this.n = n;
        this.$card = $($("#card-template").html());
        this.parentSong = parentSong;
        this.parentSong.parentGame.$songWrapper.append(this.$card);
        this.$card.children(".number").text(this.n);
        this.$card.children(".word").text(this.word);
        this.$card.click(this.reveal.bind(this));
    }
    reveal(){
        this.$card.addClass("revealed");
        this.parentSong.parentGame.cardRevealed();
    }
}

function defocusOnEsc(event){
    // TODO: put focus on something else
    if (event.keyCode===27){
        this.blur();
    }
}

function rndColor(){
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

$(function(){
    game = new Game();
});
