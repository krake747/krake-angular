import { HttpEventType, HttpHandlerFn, HttpInterceptorFn, HttpRequest } from "@angular/common/http";
import { tap } from "rxjs";

export const loggingInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
    return next(req).pipe(
        tap(event => {
            if (event.type === HttpEventType.Response) {
                console.log(req.url, "returned a response with status", event.status);
            }
        })
    );
};
