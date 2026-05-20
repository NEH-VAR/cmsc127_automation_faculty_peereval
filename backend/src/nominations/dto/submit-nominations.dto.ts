import { IsArray, ArrayMinSize, ArrayMaxSize, IsInt, ValidateNested, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class RelationshipDataDto {
  @IsInt()
  evaluator_id: number;

  @IsOptional()
  @IsInt()
  relationship_id?: number;

  @IsOptional()
  @IsString()
  relationship_other_text?: string;
}

export class SubmitNominationsDto {
  @IsArray()
  @ArrayMinSize(5)
  @ArrayMaxSize(5)
  @ValidateNested({ each: true })
  @Type(() => RelationshipDataDto)
  relationships: RelationshipDataDto[];
}