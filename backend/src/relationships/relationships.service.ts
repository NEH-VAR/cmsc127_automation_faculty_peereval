import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateRelationshipDto } from './dto/create-relationship.dto';
import { UpdateRelationshipDto } from './dto/update-relationship.dto';
import { Relationship } from './entities/relationship.entity';

@Injectable()
export class RelationshipsService implements OnModuleInit {
  private readonly defaultRelationships: Relationship[] = [
    {
      relationship_id: 1,
      relationship_name: 'Research partnership/collaboration',
      nominations: [],
    },
    {
      relationship_id: 2,
      relationship_name: 'Co-teaching in a team-taught course',
      nominations: [],
    },
    {
      relationship_id: 3,
      relationship_name: 'Service/committee engagement',
      nominations: [],
    },
  ];

  constructor(
    @InjectRepository(Relationship)
    private readonly relationshipRepo: Repository<Relationship>,
  ) {}

  async onModuleInit() {
    await this.relationshipRepo.upsert(this.defaultRelationships, ['relationship_id']);
  }

  async create(createRelationshipDto: CreateRelationshipDto) {
    const relationship = this.relationshipRepo.create(createRelationshipDto);
    return this.relationshipRepo.save(relationship);
  }

  async findAll() {
    return this.relationshipRepo.find({ order: { relationship_id: 'ASC' } });
  }

  async findOne(id: number) {
    const relationship = await this.relationshipRepo.findOne({
      where: { relationship_id: id },
    });

    if (!relationship) {
      throw new NotFoundException(`Relationship with id ${id} not found.`);
    }

    return relationship;
  }

  async update(id: number, updateRelationshipDto: UpdateRelationshipDto) {
    await this.findOne(id);
    await this.relationshipRepo.update({ relationship_id: id }, updateRelationshipDto);
    return this.findOne(id);
  }

  async remove(id: number) {
    const relationship = await this.findOne(id);
    await this.relationshipRepo.remove(relationship);
    return { message: `Relationship #${id} removed.` };
  }
}
