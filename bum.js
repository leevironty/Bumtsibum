
class Card{
  constructor(word, song){
    self = this;
    self.revealed = false;
    self.word = word;
    self.song = song;
    self.$card = $($("#card-template").html());
    self.$card.children(".word").text(word);
    self.$card.appendTo(song.$song); // TODO: Oikea paikka ei varmaan ihan tässä
    self.$card.click(self.reveal.bind(self)); // <-- TOI MUISTIIN!!!
  }
  reveal(){
    self.$card.removeClass("hidden");
    self.revealed = true;
  }
}

class Song{
  constructor(name, lyrics, game){
    self = this;
    self.active = false;
    self.name = name;
    self.lyrics = lyrics;
    self.game = game;
    self.cards = [];
    self.$song = $($("#song-template").html());
    self.$song.append(game.$songListing);

  }
  render(){
    // TODO
  }
  reveal(){
    self.$song.removeClass("hidden");
  }
  hide(){
    self.$song.addClass("hidden");
  }
  createCards(){
    self.cards =[];
    var l = self.lyrics.split(" ");
    for (var i=0;i<l.length;++i){
      self.cards.push(new Card(l[i], self));
    }
  }
}



class Game{
  constructor(gameName){
    self = this;
    self.name = gameName||"New game of Bumtsibum";
    self.songs = [];
    self.teams = [];
    // This turns to false when game starts
    self.preparation = true;
    self.$songArea = $("#song-area");
    self.$songListing = $("#song-listing");
  }
  getNewSong(){
    var sName = $("#song-name").val();
    var sLyrics =$("#song-lyrics").val();
    //console.log(self);
    self.addSong(new Song(sName, sLyrics, self));
  }
  getNewTeam(){
      game.addTeam(new Team($("#team-name").val(),rndColor()));
  }
  addSong(song){
      console.log(self);
      console.log(this);
      this.songs.push(song);
  }
  addTeam(team){
      self.teams.push(team);
  }

}

function bindButtons(){
    $("#add-team").click(game.getNewTeam);
    $("#add-song").click(game.getNewSong);
}

function rndColor(){
    return "#"+Math.floor(Math.random()*16777215).toString(16);
}


$(function(){
  game = new Game();
  bindButtons();
})
