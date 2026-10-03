import { MongoExceptionFilter } from '../../src/common/filters/mongo-exception.filter.js';
import { ArgumentsHost, HttpStatus, BadRequestException } from '@nestjs/common';
import { Error as MongooseError } from 'mongoose';

describe('MongoExceptionFilter', () => {
  let filter: MongoExceptionFilter;
  let mockResponse: any;
  let mockHost: ArgumentsHost;

  beforeEach(() => {
    filter = new MongoExceptionFilter();
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockHost = {
      switchToHttp: jest.fn().mockReturnValue({
        getResponse: () => mockResponse,
      }),
    } as any;
  });

  it('should map duplicate key error (11000) to 409 Conflict', () => {
    const error = { code: 11000 };
    filter.catch(error, mockHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.CONFLICT);
    expect(mockResponse.json).toHaveBeenCalledWith({
      statusCode: HttpStatus.CONFLICT,
      message: 'Already exists',
    });
  });

  it('should map CastError to 400 Bad Request', () => {
    const error = new MongooseError.CastError('ObjectId', 'invalid-id', 'path');
    filter.catch(error, mockHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(mockResponse.json).toHaveBeenCalledWith({
      statusCode: HttpStatus.BAD_REQUEST,
      message: 'Invalid value',
    });
  });

  it('should map ValidationError to 400 Bad Request with message', () => {
    const error = new MongooseError.ValidationError();
    error.message = 'Validation failed';
    filter.catch(error, mockHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(mockResponse.json).toHaveBeenCalledWith({
      statusCode: HttpStatus.BAD_REQUEST,
      message: 'Validation failed',
    });
  });

  it('should preserve HttpException status and message', () => {
    const error = new BadRequestException('Custom bad request');
    filter.catch(error, mockHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(mockResponse.json).toHaveBeenCalledWith({
      statusCode: HttpStatus.BAD_REQUEST,
      message: 'Custom bad request',
    });
  });
});
