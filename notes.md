# NEST
Nest (NestJS) is a framework for building efficient, scalable Node.js server-side applications. It uses progressive JavaScript, is built with and fully supports TypeScript (yet still enables developers to code in pure JavaScript) and combines elements of OOP (Object Oriented Programming), FP (Functional Programming), and FRP (Functional Reactive Programming).

# Installation
```bash
$ npm i -g @nestjs/cli
$ nest new project-name
```

# [Exception Filters](https://docs.nestjs.com/exception-filters)
Nest comes with a built-in exceptions layer which is responsible for processing all unhandled exceptions across an application. When an exception is not handled by your application code, it is caught by this layer, which then automatically sends an appropriate user-friendly response.

## Guide to implement custom filter
HttpExceptionFilter to catch all HTTP exceptions and formats the response.

**STEP 1 :** Create the Custom Exception Filter
```javascript
import { ArgumentsHost, Catch, ExceptionFilter, HttpException } from '@nestjs/common';

export interface IErrorResponse {
  success: boolean;
  message: string;
  statusCode: number;
  errors: any;
  timestamp: string;
  path: string;
}

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const context = host.switchToHttp();
    const request = context.getRequest();
    const response = context.getResponse();
    const status = exception.getStatus();

    const errorResponse: IErrorResponse = {
      success: false,
      message: exception.message,
      statusCode: status,
      errors: exception.getResponse()['message'] || null,
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    response.status(status).json(errorResponse);
  }
}
```
**STEP 2 :** Apply the Exception Filter Globally
```javascript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Apply the HttpExceptionFilter globally
  app.useGlobalFilters(new HttpExceptionFilter());

  await app.listen(3000);
  console.log(`Application is running on: http://localhost:3000`);
}
bootstrap();
```

# [Interceptors](https://docs.nestjs.com/interceptors)
An interceptor is a class annotated with the @Injectable() decorator and implements the NestInterceptor interface.

## Guide to implement custom filter
Response intercepter to maintain consistency while sending api response

**STEP 1 :** Create the Custom ResponseMessage Decorator
```javascript
import { SetMetadata } from '@nestjs/common';

export const ResponseMessage = (message: string) => {
  return SetMetadata('response-message', message);
};
```

**STEP 2 :** Create the Custom Response Interceptor
```javascript
import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable, map } from 'rxjs';
import { Reflector } from '@nestjs/core';

interface IResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, IResponse<T>> {
  constructor(private reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<IResponse<T>> {
    const request = context.switchToHttp().getRequest();
    const path = request.url;
    const responseMessage = this.reflector.get<string>('response-message', context.getHandler());

    return next.handle().pipe(
      map((data) => ({
        success: true,
        data,
        message: responseMessage || 'Success',
        statusCode: context.switchToHttp().getResponse().statusCode,
        timestamp: new Date().toISOString(),
        path,
      }))
    );
  }
}
```
**STEP 3 :** Register the Interceptor Globally
```javascript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Reflector } from '@nestjs/core';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Use global interceptor
  const reflector = app.get(Reflector);
  app.useGlobalInterceptors(new ResponseInterceptor(reflector));

  await app.listen(3000);
  console.log(`Application is running on: http://localhost:3000`);
}
bootstrap();
```

**STEP 4 :** Use @ResponseMessage() Decorator to send message
```javascript
@Post('register')
@HttpCode(HttpStatus.CREATED)
@ResponseMessage('User created successfully')
async register(@Body() data: CreateUserDto) {
    const user = await this.authService.registerUser(data);
    return { user };
}
```