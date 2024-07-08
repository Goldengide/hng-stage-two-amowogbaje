import { v4 as uuidv4 } from 'uuid';

export const generateUniqueUserId = (): string => {
  return uuidv4();
};


export const generateUniqueOrgId = (): string => {
    const timestamp = Date.now().toString(36); 
    const randomString = Math.random().toString(36).substring(2, 8); 
    return `org_${timestamp}_${randomString}`;
  };