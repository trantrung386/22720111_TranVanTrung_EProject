require('dotenv').config();

module.exports = {
    port: process.env.PORT || 3001,
    mongoURI: process.env.MONGODB_PRODUCT_URI || 'mongodb://mongo:27017/products',
    rabbitMQURI: process.env.RABBITMQ_URL || 'amqp://rabbitmq:5672',
    queueName: process.env.RABBITMQ_QUEUE || 'products',
    jwtSecret: process.env.JWT_SECRET || 'idontknow'
};
