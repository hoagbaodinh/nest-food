import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schemas/user.schema';
import mongoose, { Model } from 'mongoose';
import { hashPasswordHelper } from '@/helpers/util';
import aqp from 'api-query-params';
import { CodeAuthDto, CreateAuthDto } from '@/auth/dto/create-auth.dto';
import { v4 as uuidv4 } from 'uuid';
import dayjs from 'dayjs';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<User>,

    private readonly mailerService: MailerService,
  ) {}

  isEmailExist = async (email: string) => {
    const user = await this.userModel.exists({ email });
    if (user) return true;
    return false;
  };

  async create(createUserDto: CreateUserDto) {
    const { name, email, password, phone, address, image } = createUserDto;
    // hash password
    const isExist = await this.isEmailExist(email);

    if (isExist) {
      throw new BadRequestException('Email đã tồn tại: ' + email);
    }
    const hashPassword = await hashPasswordHelper(createUserDto.password);
    const user = await this.userModel.create({
      name,
      email,
      password: hashPassword,
      phone,
      address,
      image,
    });

    return {
      _id: user._id,
    };
  }

  async findAll(query: string, current: number, pageSize: number) {
    const { filter, sort } = aqp(query);
    if (filter.current) delete filter.current;
    if (filter.pageSize) delete filter.pageSize;

    if (!current) current = 1;
    if (!pageSize) pageSize = 10;

    const totalItems = (await this.userModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / pageSize);

    const skip = (current - 1) * pageSize;

    const results = await this.userModel
      .find(filter)
      .limit(pageSize)
      .skip(skip)
      .sort(sort as any);

    return { results, totalPages };
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  async findByEmail(email: string) {
    return await this.userModel.findOne({ email });
  }

  async update(updateUserDto: UpdateUserDto) {
    return await this.userModel.updateOne(
      { _id: updateUserDto._id },
      { ...updateUserDto },
    );
  }

  async remove(id: string) {
    // check id
    if (mongoose.isValidObjectId(id)) {
      // delete
      return await this.userModel.deleteOne({ _id: id });
    } else {
      throw new BadRequestException('User does not exist');
    }
  }

  async handleRegister(registerDto: CreateAuthDto) {
    const { name, email, password } = registerDto;
    // hash password
    const isExist = await this.isEmailExist(email);

    if (isExist) {
      throw new BadRequestException('Email đã tồn tại: ' + email);
    }
    const hashPassword = await hashPasswordHelper(password);
    const codeId = uuidv4();
    const user = await this.userModel.create({
      name,
      email,
      password: hashPassword,
      isActive: false,
      codeId,
      codeExpired: dayjs().add(5, 'minutes'),
    });

    //send Email
    this.mailerService.sendMail({
      to: user.email,
      subject: "Activation Code for OH'Kraft",
      template: 'register',
      context: {
        name: user.name ?? user.email,
        activationCode: codeId,
      },
    });

    return {
      _id: user._id,
    };
  }

  async handleActive(codeAuthDto: CodeAuthDto) {
    const user = await this.userModel.findOne({
      _id: codeAuthDto._id,
      codeId: codeAuthDto.code,
    });
    if (!user) {
      throw new BadRequestException('Mã kich hoạt không đúng hoặc đã hết hạn');
    }

    // check code expiration
    const isBeforeCheck = dayjs().isBefore(dayjs(user.codeExpired));
    if (isBeforeCheck) {
      await this.userModel.updateOne(
        { _id: codeAuthDto._id },
        { isActive: true },
      );
      return { isBeforeCheck };
    } else {
      throw new BadRequestException('Mã kich hoạt không đúng hoặc đã hết hạn');
    }
  }
}
