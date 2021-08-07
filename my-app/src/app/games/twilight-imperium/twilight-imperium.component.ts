import { Component, OnInit, HostListener } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Rx';
import { ObjectiveService } from './service/objective.service'
import { Objective } from './service/objective'
import { MessageService } from './service/message.service';
import { SetObjective } from './service/setobjective'
import { ClaimedObjective } from './service/claimedobjective'
import { PlayerScore } from './service/playerscore'
import { AnonymousSubscription } from "rxjs/Subscription";

@Component( {
  selector: 'app-twilight-imperium',
  templateUrl: './twilight-imperium.component.html',
  styleUrls: [ './twilight-imperium.component.scss' ]
} )
export class TwilightImperiumComponent {
  private log( message: string ) {
    this.messageService.add( `MainApp: ${message}` );
  }

  private scoresSubscription: AnonymousSubscription;
  private claimedSubscription: AnonymousSubscription;
  private objectivesSubscription: AnonymousSubscription;
  private setobjectivesSubscription: AnonymousSubscription;
  debug = false;
  testing = 0;
  visibleobj: Objective[] = [];
  stgonevisibleobj: Objective[] = [];
  stgtwovisibleobj: Objective[] = [];
  scores: PlayerScore[] = [];
  claimed: ClaimedObjective[] = [];
  objectives: Objective[] = [];
  objectivesStgOne: Objective[] = [];
  objectivesStgTwo: Objective[] = [];
  chosenObjectivesStgOne: Objective[] = [];
  chosenObjectivesStgTwo: Objective[] = [];
  randoms: any[] = [];

  //BRIANS
  point = Array;
  window = false;
  windowIndex: number;
  windowLevel: number;

  showWindow( i: number, level: number ) {
    this.windowLevel = level;
    this.windowIndex = i;
    this.window = true;
    alert( 'window level ' + this.windowLevel );
  }

  hideWindow() {
    this.window = false;
  }

  @HostListener( 'document:keydown', [ '$event' ] )
  handleKeyboardEvent( event: KeyboardEvent ): void {
    if ( event.keyCode === 27 ) {
      this.window = false;
    }
  }

  //BRIANS

  parseObjectives(): void {
    var objlength = this.objectives.length;
    //this.log(`parsing objectives length=${objlength}`);
    for ( var i = 0 ; i < objlength ; i ++ ) {
      var nextobj = this.objectives[i];
      if ( nextobj.stage == 1 ) {
        //this.log(`parsing stg1 objective id=${nextobj.id}`);
        this.objectivesStgOne.push( nextobj );
      } else if ( nextobj.stage == 2 ) {
        //this.log(`parsing stg2 objective id=${nextobj.id}`);
        this.objectivesStgTwo.push( nextobj );
      }
    }
  }

  parseObjectivesTwice(): void {
    for ( var i = 0 ; i < this.objectivesStgOne.length ; i ++ ) {
      var test = false;
      for ( var a = 0 ; a < this.chosenObjectivesStgOne.length ; a ++ ) {
        test = test || this.chosenObjectivesStgOne[a].id == this.objectivesStgOne[i].id;
      }
      if ( test ) {
        this.objectivesStgOne.splice( i, 1 );
      }
    }
    for ( var i = 0 ; i < this.objectivesStgTwo.length ; i ++ ) {
      var test = false;
      for ( var a = 0 ; a < this.chosenObjectivesStgTwo.length ; a ++ ) {
        test = test || this.chosenObjectivesStgTwo[a].id == this.objectivesStgTwo[i].id;
      }
      if ( test ) {
        this.objectivesStgTwo.splice( i, 1 );
      }
    }
  }

  getIsClaimed( color: string, id: number, pos: number ): boolean {
    return this.getClaimedPos( color, id ) >= 0;
  }

  getClaimedPos( color: string, id: number ): number {
    var pos = - 1;
    for ( var i = 0 ; i < this.claimed.length ; i ++ ) {
      var checkrow = color == this.claimed[i].color && id == this.claimed[i].objectiveid;
      if ( checkrow ) {
        pos = this.claimed[i].id;
      }
    }

    return pos;
  }

  getUniqueClaimed(): number {
    var max = 0;
    for ( var i = 0 ; i < this.claimed.length ; i ++ ) {
      if ( this.claimed[i].id >= max ) {
        max = this.claimed[i].id + 1;
      }
    }
    return max;
  }

  getPlayerScore( color: string ): PlayerScore {
    for ( var i = 0 ; i < this.scores.length ; i ++ ) {
      if ( this.scores[i].color == color ) {
        return this.scores[i];
      }
    }
  }

  claimobjectivescore( inpscore: PlayerScore, updown: boolean ) {
    var pscore = this.getPlayerScore( inpscore.color );
    this.log( `firstclaimed color=${pscore.color} points=${pscore.score} and updown=${updown}` );
    var pscorepoints = pscore.score;
    if ( pscorepoints == null ) {
      pscorepoints = 0;
    }
    if ( updown ) {
      var newpoints = pscorepoints + 1;
      if ( newpoints < 0 ) {
        newpoints = 0;
      }
      pscore.score = newpoints;
      this.log( `claimed color=${pscore.color} points=${pscore.points} and updown=${updown}` );
      this.objectiveService.setPlayerScore( pscore ).subscribe();
    } else {
      var newpoints = pscorepoints - 1;
      if ( newpoints < 0 ) {
        newpoints = 0;
      }
      pscore.score = newpoints;
      this.log( `claimed color=${pscore.color} points=${pscore.points} and updown=${updown}` );
      this.objectiveService.setPlayerScore( pscore ).subscribe();
    }
  }

  claimobjective( ocolor: string, oid: number ) {
    var pos = this.getUniqueClaimed();
    var isclaimed = this.getIsClaimed( ocolor, oid, pos );
    if ( ! isclaimed ) {
      var claimedObj: ClaimedObjective = {
        id: pos,
        color: ocolor,
        objectiveid: oid
      };
      this.log( `claimed color=${ocolor} and obj=${oid} and pos=${pos} and points=${this.objectives[oid].points}` );
      this.objectiveService.setClaimedObjective( claimedObj )
        .subscribe( newclaimed => this.claimed.push( newclaimed ) );
      var pscore = this.getPlayerScore( ocolor );
      var pscorepoints = pscore.score;
      if ( pscorepoints == null ) {
        pscorepoints = 0;
      }
      var newpoints = pscorepoints + this.objectives[oid].points;
      if ( newpoints < 0 ) {
        newpoints = 0;
      }
      pscore.score = newpoints;
      this.objectiveService.setPlayerScore( pscore ).subscribe();
    } else {
      this.log( `unclaimed color=${ocolor} and obj=${oid} and pos=${pos}` );
      this.objectiveService.deleteClaimedObjective( this.getClaimedPos( ocolor, oid ) )
        .subscribe( _ => this.getClaimedObjectives() );
      var pscore = this.getPlayerScore( ocolor );
      var pscorepoints = pscore.score;
      if ( pscorepoints == null ) {
        pscorepoints = 0;
      }
      var newpoints = pscorepoints - this.objectives[oid].points;
      if ( newpoints < 0 ) {
        newpoints = 0;
      }
      pscore.score = newpoints;
      this.objectiveService.setPlayerScore( pscore ).subscribe();
    }
  }

  getClaimedObjectives() {
    this.refreshClaims();
  }

  revealStageOneObjective() {
    if ( confirm( "Are you sure you want to reveal the next stage one objective?" ) ) {
      var nextobj = this.stgonevisibleobj.length;
      if ( nextobj < 5 ) {
        this.visibleobj.push( this.chosenObjectivesStgOne[nextobj] );
        this.stgonevisibleobj.push( this.chosenObjectivesStgOne[nextobj] );
        this.objectiveService.setRevealedObj( nextobj, this.chosenObjectivesStgOne[nextobj].id, true ).subscribe();
      } else if ( confirm( "All 5 stage one objectives have been revealed, are you sure you want to reveal a stage one objective?" ) ) {
        this.getRandomStgOneObjective();
        var rndobj = this.chosenObjectivesStgOne[this.chosenObjectivesStgOne.length - 1];
        this.visibleobj.push( rndobj );
        this.stgonevisibleobj.push( rndobj );
        var thisobj: SetObjective = {
          id: this.chosenObjectivesStgOne.length + this.chosenObjectivesStgTwo.length,
          objectiveid: this.chosenObjectivesStgOne[this.chosenObjectivesStgOne.length - 1].id,
          isvisible: true,
          isextra: true
        };
        this.objectiveService.addSetObjective( thisobj ).subscribe();
      }
    }
  }

  revealStageTwoObjective() {
    if ( confirm( "Are you sure you want to reveal the next stage two objective?" ) ) {
      var nextobj = this.stgonevisibleobj.length;
      var lastobj = this.stgtwovisibleobj.length;
      if ( nextobj < 5 || lastobj >= 5 ) {
        var cont = true;
        if ( nextobj < 5 ) {
          if ( ! confirm( "Not all 5 stage one objectives have been revealed, are you sure you want to reveal a stage two objective?" ) ) {
            cont = false;
          }
        }
        if ( lastobj >= 5 ) {
          if ( ! confirm( "All 5 stage two objectives have been revealed, are you sure you want to reveal a stage two objective?" ) ) {
            cont = false;
          }
        }
        if ( cont ) {
          this.getRandomStgTwoObjective();
          var rndobj = this.chosenObjectivesStgTwo[this.chosenObjectivesStgTwo.length - 1];
          this.visibleobj.push( rndobj );
          this.stgtwovisibleobj.push( rndobj );
          var thisobj: SetObjective = {
            id: this.chosenObjectivesStgOne.length + this.chosenObjectivesStgTwo.length,
            objectiveid: rndobj.id,
            isvisible: true,
            isextra: true
          };
          this.objectiveService.addSetObjective( thisobj ).subscribe();
        }
      } else {
        nextobj = this.stgtwovisibleobj.length;
        this.visibleobj.push( this.chosenObjectivesStgTwo[nextobj] );
        this.stgtwovisibleobj.push( this.chosenObjectivesStgTwo[nextobj] );
        //this.log(`id=${nextobj}`);
        this.objectiveService.setRevealedObj( nextobj + 5, this.chosenObjectivesStgTwo[nextobj].id, true ).subscribe();
      }
    }
  }

  getObjectives(): void {
    this.refreshObjectives();

    this.refreshSetObjectives();

    this.getClaimedObjectives();

    this.refreshScores();
  }

  getIsVisible( id: number ): boolean {
    var check = false;
    for ( var i = 0 ; i < this.visibleobj.length ; i ++ ) {
      check = check || this.visibleobj[i].id == id;
    }
    return check;
  }

  processSetObjectives( setobjectives: SetObjective[] ) {
    /*for( var i=0;i<setobjectives.length;i++ )
    {
    this.log( `id=${setobjectives[i].id} oid=${setobjectives[i].objectiveid} visible=${setobjectives[i].isvisible}` );
    }*/

    this.chosenObjectivesStgOne = [];
    this.chosenObjectivesStgTwo = [];
    //this.visibleobj = [];
    //this.stgonevisibleobj = [];
    //this.stgtwovisibleobj = [];
    var stgonevisiblelocal = [];
    var stgtwovisiblelocal = [];

    var anyvisible = false;

    for ( var i = 0 ; i < setobjectives.length ; i ++ ) {
      var isvisibleobj = setobjectives[i].isvisible;
      var isstgoneobj = this.objectives[setobjectives[i].objectiveid].stage == 1;
      if ( isstgoneobj ) {
        this.chosenObjectivesStgOne.push( this.objectives[setobjectives[i].objectiveid] );
        if ( isvisibleobj ) {
          stgonevisiblelocal.push( this.objectives[setobjectives[i].objectiveid] );
          anyvisible = true;
        }
      } else {
        this.chosenObjectivesStgTwo.push( this.objectives[setobjectives[i].objectiveid] );
        if ( isvisibleobj ) {
          stgtwovisiblelocal.push( this.objectives[setobjectives[i].objectiveid] );
          anyvisible = true;
        }
      }

      /*if( setobjectives[i].isvisible )
      {
        this.visibleobj.push( this.objectives[setobjectives[i].objectiveid] );
      }*/
    }

    for ( var a = 0 ; a < stgonevisiblelocal.length ; a ++ ) {
      var tobeadded = true;
      for ( var b = 0 ; b < this.stgonevisibleobj.length ; b ++ ) {
        tobeadded = tobeadded && this.stgonevisibleobj[b].id != stgonevisiblelocal[a].id;
      }
      if ( tobeadded ) {
        this.stgonevisibleobj.push( stgonevisiblelocal[a] );
        this.visibleobj.push( stgonevisiblelocal[a] );
      }
    }

    for ( var a = 0 ; a < stgtwovisiblelocal.length ; a ++ ) {
      var tobeadded = true;
      for ( var b = 0 ; b < this.stgtwovisibleobj.length ; b ++ ) {
        tobeadded = tobeadded && this.stgtwovisibleobj[b].id != stgtwovisiblelocal[a].id;
      }
      if ( tobeadded ) {
        this.stgtwovisibleobj.push( stgtwovisiblelocal[a] );
        this.visibleobj.push( stgtwovisiblelocal[a] );
      }
    }

    if ( ! anyvisible ) {
      this.visibleobj = [];
      this.stgonevisibleobj = [];
      this.stgtwovisibleobj = [];
    }
  }

  test() {
    for ( var i = 0 ; i < this.scores.length ; i ++ ) {
      this.log( `player=${this.scores[i].color} score=${this.getPlayerScore( this.scores[i].color ).score}` );
    }
  }

  getRandomStgOneObjective() {
    var i = Math.floor( (Math.random() * this.objectivesStgOne.length) );
    var objqueued = this.objectivesStgOne[i];
    this.log( `adding id=${i} length=${this.objectivesStgOne.length} totalobj=${this.objectives.length}` );
    this.chosenObjectivesStgOne.push( objqueued );
    this.objectivesStgOne.splice( i, 1 );
  }

  getRandomStgTwoObjective() {
    var i = Math.floor( (Math.random() * this.objectivesStgTwo.length) );
    var objqueued = this.objectivesStgTwo[i];
    this.log( `adding id=${i} length=${this.objectivesStgOne.length} totalobj=${this.objectives.length}` );
    this.chosenObjectivesStgTwo.push( objqueued );
    this.objectivesStgTwo.splice( i, 1 );
  }

  zeroScore() {
    for ( var i = 0 ; i < this.scores.length ; i ++ ) {
      this.scores[i].score = 0;
      this.objectiveService.setPlayerScore( this.scores[i] ).subscribe();
    }

    for ( var a = 0 ; a < this.claimed.length ; a ++ ) {
      this.objectiveService.deleteClaimedObjective( this.claimed[a].id )
        .subscribe();
    }

    this.claimed = [];
    this.visibleobj = [];
    this.stgtwovisibleobj = [];
    this.stgonevisibleobj = [];
  }

  chooseObjectives(): void {
    if ( confirm( "Are you sure you want to start a new game?" ) ) {
      this.objectiveService.getSetObjectives().subscribe( setobjectivesub => {
        var extraset = [];
        for ( var i = 0 ; i < setobjectivesub.length ; i ++ ) {
          if ( setobjectivesub[i].isextra ) {
            extraset.push( setobjectivesub[i] );
          }
        }
        this.objectiveService.deleteExtraObjective( extraset );
      } );
      this.chosenObjectivesStgOne = [];
      this.chosenObjectivesStgTwo = [];
      this.objectivesStgOne = [];
      this.objectivesStgTwo = [];

      this.parseObjectives();

      for ( var i = 0 ; i < 5 ; i ++ ) {
        this.getRandomStgOneObjective();
        //this.log(`length of array id=${this.objectivesStgOne.length}`);
      }
      for ( var a = 0 ; a < 5 ; a ++ ) {
        this.getRandomStgTwoObjective();
      }

      this.setObjectives();
      this.zeroScore();
    }
  }

  setObjectives(): void {
    var fullObjs = this.chosenObjectivesStgOne.concat( this.chosenObjectivesStgTwo );
    this.objectiveService.setObjectives( fullObjs );
    //this.objectiveService.addSetObjective(this.chosenobjectives[0]).subscribe();
    //.subscribe();
  }

  private refreshObjectives(): void {
    this.objectivesSubscription = this.objectiveService.getObjectives().subscribe( objectivesub => {
      this.objectives = objectivesub;
      this.parseObjectives();
      this.parseObjectivesTwice();
      this.subscribeToObjectives();
    } );
  }

  private refreshSetObjectives(): void {
    this.setobjectivesSubscription = this.objectiveService.getSetObjectives().subscribe( setobjectivesub => {
      this.processSetObjectives( setobjectivesub );
      this.subscribeToSetObjectives();
    } );
  }

  private refreshScores(): void {
    this.scoresSubscription = this.objectiveService.getPlayerScores().subscribe( scoresub => {
      this.scores = scoresub;
      this.subscribeToScores();
    } );
  }

  private subscribeToObjectives(): void {
    this.objectivesSubscription = Observable.timer( 2000 ).first().subscribe( () => this.refreshObjectives() );
  }

  private subscribeToSetObjectives(): void {
    this.setobjectivesSubscription = Observable.timer( 2000 ).first().subscribe( () => this.refreshSetObjectives() );
  }

  private subscribeToScores(): void {
    this.scoresSubscription = Observable.timer( 2000 ).first().subscribe( () => this.refreshScores() );
  }

  private refreshClaims(): void {
    this.claimedSubscription = this.objectiveService.getClaimedObjectives().subscribe( claimsub => {
      this.claimed = claimsub;
      this.subscribeToClaims();
    } );
  }

  private subscribeToClaims(): void {
    this.claimedSubscription = Observable.timer( 2000 ).first().subscribe( () => this.refreshClaims() );
  }

  constructor( private http: HttpClient, private objectiveService: ObjectiveService, public messageService: MessageService ) {
  }

  ngOnInit() {
    this.getObjectives();
  }

  ngOnDestroy() {
    this.scoresSubscription.unsubscribe();
    this.claimedSubscription.unsubscribe();
    this.objectivesSubscription.unsubscribe();
  }

}
