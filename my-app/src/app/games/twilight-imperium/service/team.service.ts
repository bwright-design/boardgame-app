import { Injectable } from '@angular/core';
import { Team } from './team';
import { TEAMS } from './fake-teams';
import { Observable, of } from 'rxjs';
import { Component } from '@angular/core';
import { HttpClient,HttpHeaders } from '@angular/common/http';
import { catchError, map, tap } from 'rxjs/operators';
import { MessageService } from './message.service';

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type':  'application/json'
  })
};

@Injectable({
  providedIn: 'root',
})
export class TeamService {

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
	  this.messageService.add(`TeamService: ${message}`);
	}

  constructor(private http: HttpClient, private messageService: MessageService) { }

	/** GET heroes from the server */
	getTeams (): Observable<Team[]> {
	  return this.http.get<Team[]>('/api/teams')
		.pipe(
		  tap(_ => this.log('fetched teams')),
		  catchError(this.handleError<Team[]>('getTeams', []))
		);
	}
	/** POST: add a new hero to the database */
	addTeam (team: Team): Observable<Team> {
	  return this.http.post<Team>('/api/teams', team, httpOptions)
		.pipe(
		  catchError(this.handleError('addTeam', team))
		);
	}
}
