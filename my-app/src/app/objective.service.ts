import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Component } from '@angular/core';
import { HttpClient,HttpHeaders } from '@angular/common/http';
import { catchError, map, tap } from 'rxjs/operators';
import { MessageService } from './message.service';
import { Objective } from './objective'
import { SetObjective } from './setobjective'
import { ClaimedObjective } from './claimedobjective'
import { PlayerScore } from './playerscore'

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type':  'application/json'
  })
};

@Injectable({
  providedIn: 'root'
})
export class ObjectiveService {
	objectivesURL= '/api/objectives';
	setObjectivesURL= '/api/setobjectives';
	claimedObjectivesURL= '/api/claimedobjectives';
	playerScoreURL= '/api/playerscore';
	/**
	 * Handle Http operation that failed.
	 * Let the app continue.
	 * @param operation - name of the operation that failed
	 * @param result - optional value to return as the observable result
	 */
	private handleError<T> (operation = 'operation', result?: T) {
	  return (error: any): Observable<T> => {

		// TODO: send the error to remote logging infrastructure
		console.error(error); // log to console instead

		// TODO: better job of transforming error for user consumption
		this.log(`${operation} failed: ${error.message}`);

		// Let the app keep running by returning an empty result.
		return of(result as T);
	  };
	}

	/** Log a HeroService message with the MessageService */
	private log(message: string) {
	  this.messageService.add(`ObjectiveService: ${message}`);
	}
	
	constructor(private http: HttpClient, private messageService: MessageService) { }

	/** GET claimedobjs from the server */
	getClaimedObjectives (): Observable<ClaimedObjective[]> {
	  return this.http.get<ClaimedObjective[]>(this.claimedObjectivesURL)
		.pipe(
		  tap(_ => this.log('fetched claimed objectives')),
		  catchError(this.handleError<ClaimedObjective[]>('getClaimedObjectives', []))
		);
	}
	/** GET objs from the server */
	getObjectives (): Observable<Objective[]> {
	  return this.http.get<Objective[]>(this.objectivesURL)
		.pipe(
		  tap(_ => this.log('fetched objectives')),
		  catchError(this.handleError<Objective[]>('getObjectives', []))
		);
	}

	/** GET objs from the server */
	getPlayerScores (): Observable<PlayerScore[]> {
	  return this.http.get<PlayerScore[]>(this.playerScoreURL)
		.pipe(
		  tap(_ => this.log('fetched playerscores')),
		  catchError(this.handleError<PlayerScore[]>('getPlayerScore', []))
		);
	}
	
	/** GET objective by id. Will 404 if id not found */
	getObjective(id: number): Observable<Objective> {
	  const url = `${this.objectivesURL}/${id}`;
	  return this.http.get<Objective>(url).pipe(
		tap(_ => this.log(`fetched objective id=${id}`)),
		catchError(this.handleError<Objective>(`getObjective id=${id}`))
	  );
	}

	/** GET setobjs from the server */
	getSetObjectives (): Observable<SetObjective[]> {
	  return this.http.get<SetObjective[]>(this.setObjectivesURL)
		.pipe(
		  tap(_ => this.log('fetched set objectives')),
		  catchError(this.handleError<SetObjective[]>('getSetObjectives', []))
		);
	}
	
	/** PUT: update the set objective on the server */
	setObjectives (setobjectives: Objective[]): void {
	  //this.log( `now sending id=${setobjective.id} oid=${setobjective.objectiveid}` );
	  for( var i=0;i<setobjectives.length;i++ )
	  {
		  var thisobj: SetObjective = {
			id: i,
			objectiveid: setobjectives[i].id,
			isvisible: false
		  };
		  this.http.put(`${this.setObjectivesURL}/${i}`, thisobj, httpOptions).pipe(
			tap( (newobj: SetObjective) => this.log(`updated objective id=${newobj.id} oid=${newobj.objectiveid}`)),
			catchError(this.handleError<any>('updateObjective'))).subscribe();
	  }
	}

	/** PUT: update the playerscore objective on the server */
	setPlayerScore (playerscore: PlayerScore): Observable<PlayerScore> {
	  //this.log( `now sending id=${setobjective.id} oid=${setobjective.objectiveid}` );
		  return this.http.put(`${this.playerScoreURL}/${playerscore.id}`, playerscore, httpOptions).pipe(
			tap( (newobj: PlayerScore) => this.log(`updated playerscore id=${newobj.id} oid=${newobj.score}`)),
			catchError(this.handleError<any>('updatePlayerScore')));
	}
	
	/** PUT: update the setobjective visible objective on the server */
	setRevealedObj (rid: number, oid: number, isv: boolean): Observable<SetObjective> {
		  var thisobj: SetObjective = {
			id: rid,
			objectiveid: oid,
			isvisible: isv
		  };
		  return this.http.put(`${this.setObjectivesURL}/${rid}`, thisobj, httpOptions).pipe(
			tap( (newobj: SetObjective) => this.log(`updated objective id=${newobj.id} oid=${newobj.objectiveid}`)),
			catchError(this.handleError<any>('updateVisibleObjective')));
	}

	/** post: add the claimed objective on the server */
	setClaimedObjective (claimed: ClaimedObjective): Observable<ClaimedObjective[]> {
	  //this.log( `now sending id=${setobjective.id} oid=${setobjective.objectiveid}` );
		  return this.http.post(this.claimedObjectivesURL, claimed, httpOptions).pipe(
			tap( (newobj: ClaimedObjective) => this.log(`updated claimed objective id=${newobj.id} color=${newobj.color} oid=${newobj.objectiveid}`)),
			catchError(this.handleError<any>('addClaimedObjective')));
	}

	/** delete: delete the claimed objective on the server */
	deleteClaimedObjective (id: number): Observable<ClaimedObjective> {
	  //this.log( `now sending id=${setobjective.id} oid=${setobjective.objectiveid}` );
		  return this.http.delete(`${this.claimedObjectivesURL}/${id}`, httpOptions).pipe(
			tap( (newobj: ClaimedObjective) => this.log(`deleted claimed objective id=${newobj.id} color=${newobj.color} oid=${newobj.objectiveid}`)),
			catchError(this.handleError<any>('deleteClaimedObjective')));
	}
}
