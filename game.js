class Game{
    constructor(){
        this.setup = {};
        this.setup.$teamListing = $("#team-listing");
        this.setup.$songListing = $("#song-listing");
        this.$gameArea = $("#game-area");
        this.songs =  [];
        this.teams = [];
        this.liveGame = false;
        //me = this;
    }
    addTeam(team){
        this.teams.push(team);
    }
    addSong(song){
        this.songs.push(song);
    }
    getNewTeam(){
        this.addTeam(new Team($("#team-name").val(),rndColor()));
        $("#team-name").val(""); // wipe input field clear
    }
    getNewSong(){
        var sName = $("#song-name").val();
        $("#song-name").val("");
        var sLyrics = $("#song-lyrics").val();
        $("#song-lyrics").val("");
        this.addSong(new Song(sName, sLyrics, this));
    }
    startGame(){
        // TODO: add real settings
        // TODO: hide songs on game start
        // TODO: add button to reveal songs
        // TODO: initialise ui elements for players
        // TODO: make game controls for game master
        this.settings = {
            time: 30,
            trapsPerLevel: 0,
        };
        this.liveGame = true;
    }

}


class Team{
    constructor(name, color, parentGame){
        this.name = name;
        this.color = color;
        this.score = 0;
        this.wonSongs = [];
        this.parentGame = parentGame;
    }
}

class Song{
    constructor(name, lyrics, parentGame){
        this.name = name;
        this.lyrics = lyrics;
        this.parentGame = parentGame;
        this.wordList = this.getParsedLyrics();
        this.gameCards = [];
        this.active = false;
        this.addCardToEditor();
    }
    /* // useless.
    addCardsToEditor(){
        // Create div for cards to go
        // make cards and place them in div
        this.$editCardArea = $($("#edit-card-area-template").html());
        this.parentGame.setup.$songListing.append(this.$editCardArea);
        this.$editCardArea.children(".title").text(this.name);
        this.editCards =[];
        var l = this.lyrics.split(" ");
        for (var i=0;i<l.length;++i){
            this.editCards.push(new EditCard(l[i], this));
        }
    }*/
    addCardToEditor(){
        this.$editSong = $($("#edit-song-template").html());
        this.parentGame.setup.$songListing.append(this.$editSong);
        this.$editSong.children(".edit-song-title").val(this.name);
        this.$editSong.children(".edit-lyrics").val(this.lyrics);
        this.updateEditorCounter();
        // TODO: change to keydown but make it work consistently with single letter words.
        this.$editSong.children(".edit-lyrics").on("keyup change", this.updateLyrics.bind(this));
        this.$editSong.children(".edit-song-title").on("keyup change", this.updateTitle.bind(this));
    }
    updateEditorCounter(){
        console.log("counter update called");
        this.wordList = this.getParsedLyrics();
        this.$editSong.find(".n").text(this.wordList.length);
    }
    getParsedLyrics(){
        return this.lyrics.split(" ").filter(word => word !== "");
    }
    updateLyrics(){
        this.lyrics = this.$editSong.children(".edit-lyrics").val();
        this.updateEditorCounter();
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
        this.parentSong.parentGame.$gameArea.append(this.$card);
        this.$card.children(".number").text(this.n);
        this.$card.children(".word").text(this.word);
        this.$card.click(this.reveal.bind(this));
    }
    reveal(){
        // TODO: add interaction with game
        this.$card.addClass("revealed");
    }
}

function defocus(event){
    // TODO: put focus on something else
    if (event.keyCode==27){
        this.blur();
    }
}

function bindButtons(){
    // TODO: make this Game's method
    $("#add-team").click(game.getNewTeam.bind(game));
    $("#add-song").click(game.getNewSong.bind(game));
    $("#game-start").click(game.startGame.bind(game));

    $("input").on("keydown", defocus);
}

function rndColor(){
    return "#"+Math.floor(Math.random()*16777215).toString(16);
}


$(function(){
    game = new Game();
    bindButtons();
})
