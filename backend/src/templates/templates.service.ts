import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateTemplateDto } from './dto/create-template.dto';
import { UpdateTemplateDto } from './dto/update-template.dto';
import {
  MessageTemplate,
  MessageTemplateDocument,
} from './schemas/template.schema';

@Injectable()
export class TemplatesService {
  constructor(
    @InjectModel(MessageTemplate.name)
    private readonly templateModel: Model<MessageTemplateDocument>,
  ) {}

  create(createTemplateDto: CreateTemplateDto) {
    return this.applyDefaultAndCreate(createTemplateDto);
  }

  findAll() {
    return this.templateModel.find().sort({ createdAt: -1 }).lean();
  }

  async findOne(id: string) {
    const template = await this.templateModel.findById(id).lean();

    if (!template) {
      throw new NotFoundException('Template not found.');
    }

    return template;
  }

  async getDefaultTemplate() {
    return this.templateModel.findOne({ isDefault: true }).lean();
  }

  async update(id: string, updateTemplateDto: UpdateTemplateDto) {
    if (updateTemplateDto.isDefault) {
      await this.templateModel.updateMany(
        { _id: { $ne: id } },
        {
          $set: {
            isDefault: false,
          },
        },
      );
    }

    const template = await this.templateModel
      .findByIdAndUpdate(id, updateTemplateDto, {
        new: true,
        runValidators: true,
      })
      .lean();

    if (!template) {
      throw new NotFoundException('Template not found.');
    }

    return template;
  }

  private async applyDefaultAndCreate(createTemplateDto: CreateTemplateDto) {
    if (createTemplateDto.isDefault) {
      await this.templateModel.updateMany(
        {},
        {
          $set: {
            isDefault: false,
          },
        },
      );
    }

    return this.templateModel.create(createTemplateDto);
  }
}
