// import {
//     Injectable,
//     NestInterceptor,
//     ExecutionContext,
//     CallHandler,
//     HttpException,
//   } from '@nestjs/common';
//   import { Observable, throwError } from 'rxjs';
//   import { catchError } from 'rxjs/operators';
  
//   @Injectable()
//   export class ReconnectionInterceptor implements NestInterceptor {
//     intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
//       return next.handle().pipe(
//         retryWhen((errors) =>
//           errors.pipe(
//             catchError((error) => {
//               if (error instanceof HttpException && error.status === 503) {
//                 console.log('SSE connection error, attempting reconnection...');
//               } else {
//                 // Rethrow other errors
//                 return throwError(error);
//               }
//             })
//           )
//         )
//       );
//     }
  
//     private reconnect(context: ExecutionContext): Observable<any> {
//       const retryInterval = 5000;
//       const maxRetries = 3;
  
//       return new Observable((observer) => {
//         let retryCount = 0;
//         const intervalId = setInterval(() => {
//           if (retryCount < maxRetries) {
//             retryCount++;
//             try {
//               const result = this.retryRequest(context);
//               observer.next(result);
//               observer.complete();
//               clearInterval(intervalId);
//             } catch (error) {
//               console.error('Reconnection attempt failed:', error);
//             }
//           } else {
//             observer.error(new Error('Maximum reconnection attempts exceeded'));
//             clearInterval(intervalId);
//           }
//         }, retryInterval);
//       });
//     }
  
//     private retryRequest(context: ExecutionContext): any {
//       // Implement logic to retry the original request
//       // You might need to access request information from the context
//       // and make a new HTTP request or re-emit the SSE event
//     }
//   }
  