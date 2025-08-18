export const required = (v?: string) => (!!v && v.trim().length > 0) || 'Required';
