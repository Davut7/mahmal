import { Injectable, OnModuleInit } from '@nestjs/common';
import amqp, { ChannelWrapper } from 'amqp-connection-manager';
import { Channel } from 'amqplib';

@Injectable()
export class RabbitmqService implements OnModuleInit {
  private videoWrapper: ChannelWrapper;
  private imageWrapper: ChannelWrapper;

  constructor() {
    const connection = amqp.connect([process.env.RABBITMQ_SERVER]);

    this.videoWrapper = connection.createChannel({
      setup: (channel: Channel) => {
        return channel.assertQueue('videoQueue', { durable: true });
      },
    });

    this.imageWrapper = connection.createChannel({
      setup: (channel: Channel) => {
        return channel.assertQueue('imageQueue', { durable: true });
      },
    });
  }

  public async onModuleInit() {
    try {
      await this.setupQueues();
    } catch (error) {
      console.log('Error during RabbitMQ setup:', error);
    }
  }

  private async setupQueues() {
    await this.videoWrapper.addSetup((channel: Channel) => {
      return channel.assertQueue('videoQueue', { durable: true });
    });
    await this.imageWrapper.addSetup((channel: Channel) => {
      return channel.assertQueue('imageQueue', { durable: true });
    });
  }

  public addToImageQueue(mediaId: string, fileName: string) {
    try {
      this.imageWrapper.sendToQueue(
        'imageQueue',
        Buffer.from(JSON.stringify({ mediaId: mediaId, fileName: fileName })),
        {
          persistent: true,
        },
      );
    } catch (error) {
      console.error('Error producing message:', error);
    }
  }
  public addToVideoQueue(mediaId: string, fileName: string) {
    try {
      this.videoWrapper.sendToQueue(
        'videoQueue',
        Buffer.from(JSON.stringify({ mediaId: mediaId, fileName: fileName })),
        {
          persistent: true,
        },
      );
    } catch (error) {
      console.error('Error producing message:', error);
    }
  }
}
