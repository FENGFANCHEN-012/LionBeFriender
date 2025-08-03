const request = require('supertest');
const app = require('../../../app'); // Adjust path as needed
const chatModel = require('../../../models/fengfan_folder/chat_model');

// Mock the chat model
jest.mock('../../../models/fengfan_folder/chat_model');

describe('Chat Controller', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /private-chat/:senderId/:receiverId', () => {
    it('should return chat history for valid sender and receiver', async () => {
      const mockMessages = [
        { id: 1, sender_id: 1, receiver_id: 2, message: 'Hello', created_at: '2023-01-01' },
        { id: 2, sender_id: 2, receiver_id: 1, message: 'Hi there', created_at: '2023-01-01' }
      ];
      
      chatModel.getChatHistory.mockResolvedValue(mockMessages);
      
      const res = await request(app)
        .get('/private-chat/1/2')
        .expect(200);

      expect(chatModel.getChatHistory).toHaveBeenCalledWith('1', '2');
      expect(res.body).toEqual(mockMessages);
    });

    it('should return 500 when database error occurs', async () => {
      chatModel.getChatHistory.mockRejectedValue(new Error('Database error'));
      
      const res = await request(app)
        .get('/private-chat/1/2')
        .expect(500);

      expect(res.body).toEqual({ error: 'Failed to fetch chat history' });
    });

    it('should return 400 when validation fails', async () => {
      const res = await request(app)
        .get('/private-chat/invalid/2')
        .expect(400);

      expect(chatModel.getChatHistory).not.toHaveBeenCalled();
    });
  });

  describe('POST /private-chat', () => {
    it('should successfully send a message', async () => {
      chatModel.sendMessage.mockResolvedValue();
      
      const messageData = {
        sender_id: 1,
        receiver_id: 2,
        message: 'Hello'
      };

      const res = await request(app)
        .post('/private-chat')
        .send(messageData)
        .expect(200);

      expect(chatModel.sendMessage).toHaveBeenCalledWith(1, 2, 'Hello');
      expect(res.body).toEqual({ message: 'Message sent successfully' });
    });

    it('should return 400 when required fields are missing', async () => {
      const invalidData = {
        sender_id: 1
        // Missing receiver_id and message
      };

      const res = await request(app)
        .post('/private-chat')
        .send(invalidData)
        .expect(400);

      expect(chatModel.sendMessage).not.toHaveBeenCalled();
    });

    it('should return 500 when message sending fails', async () => {
      chatModel.sendMessage.mockRejectedValue(new Error('Database error'));
      
      const messageData = {
        sender_id: 1,
        receiver_id: 2,
        message: 'Hello'
      };

      const res = await request(app)
        .post('/private-chat')
        .send(messageData)
        .expect(500);

      expect(res.body).toEqual({ error: 'Failed to send message' });
    });

    it('should return 400 when message is empty', async () => {
      const invalidData = {
        sender_id: 1,
        receiver_id: 2,
        message: ''
      };

      const res = await request(app)
        .post('/private-chat')
        .send(invalidData)
        .expect(400);

      expect(chatModel.sendMessage).not.toHaveBeenCalled();
    });
  });
});
