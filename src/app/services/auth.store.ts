import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import { map, shareReplay, tap } from "rxjs/operators";
import { User } from "../model/user"

const AUTH_DATA = "auth_data";  // key to save and retrieve data from Local storage

@Injectable({
    providedIn: 'root'
})
export class AuthStore {
    private subject = new BehaviorSubject<User>(null);

    user$: Observable<User> = this.subject.asObservable();

    isLoggedin$: Observable<boolean>;
    isLoggedOut$: Observable<boolean>;

    constructor(private httpClient: HttpClient){
        this.isLoggedin$ = this.user$.pipe(map(user => !!user));
        this.isLoggedOut$ = this.isLoggedin$.pipe(map(loggedIn => !loggedIn));

        const user: string = localStorage.getItem(AUTH_DATA);

        if(user) {
            this.subject.next(JSON.parse(user));
        }
    }

    login(email: string, password: string): Observable<User> {
        return this.httpClient.post<User>('/api/login', {email, password})
            .pipe(
                tap(user => {
                    this.subject.next(user);
                    localStorage.setItem(AUTH_DATA, JSON.stringify(user));
                }),
                shareReplay()
            );
    }

    logout(){
        this.subject.next(null);
        localStorage.removeItem(AUTH_DATA);
    }
}