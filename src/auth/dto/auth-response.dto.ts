import { ApiProperty } from "@nestjs/swagger";

export class AuthResponseDto {
    @ApiProperty({
        description: 'JWT access token',
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImEwMDEwZWExLWVlMGMtNDk1YS04OGQ1LWY3MDUxOTFiZTFlYSIsImlhdCI6MTc5MzcxNDMwMiwiZXhwIjoxNzkzNzIxNTAyfQ.zQS4hXv3op7x8Vn8Otig5ovfaHe9thSvpBl8vWjbmAM',
    })
    accessToken: string;
}