const sql = require('mssql');
const chatModel = require('../../../models/fengfan_folder/chat_model');
const dbConfig = require('../../../dbConfig');

// Mock the mssql module
jest.mock('mssql');

describe('Chat Model', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getChatHistory', () => {
    it('should return chat history for valid sender and receiver', async () => {
      const mockRecordset = [
        { sender_id: 1, receiver_id: 2, message: 'Hello', sent_at: '2023-01-01' },
        { sender_id: 2, receiver_id: 1, message: 'Hi there', sent_at: '2023-01-01' }
      ];

      // Mock the SQL connection and query execution
      const mockRequest = {
        input: jest.fn().mockReturnThis(),
        query: jest.fn().mockResolvedValue({ recordset: mockRecordset })
      };
      const mockConnection = {
        request: jest.fn().mockReturnValue(mockRequest),
        close: jest.fn()
      };
      sql.connect.mockResolvedValue(mockConnection);

      const result = await chatModel.getChatHistory(1, 2);

      expect(sql.connect).toHaveBeenCalledWith(dbConfig);
      expect(mockRequest.input).toHaveBeenCalledWith('sender_id', sql.Int, 1);
      expect(mockRequest.input).toHaveBeenCalledWith('receiver_id', sql.Int, 2);
      expect(mockRequest.query).toHaveBeenCalledWith(expect.stringContaining('FROM PrivateChats'));
      expect(mockConnection.close).toHaveBeenCalled();
      expect(result).toEqual(mockRecordset);
    });

    it('should throw error when database query fails', async () => {
      const mockConnection = {
        request: jest.fn().mockReturnThis(),
        input: jest.fn().mockReturnThis(),
        query: jest.fn().mockRejectedValue(new Error('Database error')),
        close: jest.fn()
      };
      sql.connect.mockResolvedValue(mockConnection);

      await expect(chatModel.getChatHistory(1, 2)).rejects.toThrow('Failed to fetch chat history');
      expect(mockConnection.close).toHaveBeenCalled();
    });

    it('should close connection even if query fails', async () => {
      const mockConnection = {
        request: jest.fn().mockReturnThis(),
        input: jest.fn().mockReturnThis(),
        query: jest.fn().mockRejectedValue(new Error('Database error')),
        close: jest.fn()
      };
      sql.connect.mockResolvedValue(mockConnection);

      try {
        await chatModel.getChatHistory(1, 2);
      } catch (error) {
        expect(mockConnection.close).toHaveBeenCalled();
      }
    });
  });

  describe('sendMessage', () => {
    it('should successfully send a message', async () => {
      const mockRequest = {
        input: jest.fn().mockReturnThis(),
        query: jest.fn().mockResolvedValue({ rowsAffected: [1] })
      };
      const mockConnection = {
        request: jest.fn().mockReturnValue(mockRequest),
        close: jest.fn()
      };
      sql.connect.mockResolvedValue(mockConnection);

      await chatModel.sendMessage(1, 2, 'Hello');

      expect(sql.connect).toHaveBeenCalledWith(dbConfig);
      expect(mockRequest.input).toHaveBeenCalledWith('sender_id', sql.Int, 1);
      expect(mockRequest.input).toHaveBeenCalledWith('receiver_id', sql.Int, 2);
      expect(mockRequest.input).toHaveBeenCalledWith('message', sql.NVarChar, 'Hello');
      expect(mockRequest.query).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO PrivateChats'));
      expect(mockConnection.close).toHaveBeenCalled();
    });

    it('should throw error when message sending fails', async () => {
      const mockConnection = {
        request: jest.fn().mockReturnThis(),
        input: jest.fn().mockReturnThis(),
        query: jest.fn().mockRejectedValue(new Error('Database error')),
        close: jest.fn()
      };
      sql.connect.mockResolvedValue(mockConnection);

      await expect(chatModel.sendMessage(1, 2, 'Hello')).rejects.toThrow('Failed to send message');
      expect(mockConnection.close).toHaveBeenCalled();
    });

    it('should close connection even if sending fails', async () => {
      const mockConnection = {
        request: jest.fn().mockReturnThis(),
        input: jest.fn().mockReturnThis(),
        query: jest.fn().mockRejectedValue(new Error('Database error')),
        close: jest.fn()
      };
      sql.connect.mockResolvedValue(mockConnection);

      try {
        await chatModel.sendMessage(1, 2, 'Hello');
      } catch (error) {
        expect(mockConnection.close).toHaveBeenCalled();
      }
    });
  });
});
