export const validators = {
  phone: (value: string): boolean => {
    return /^1[3-9]\d{9}$/.test(value);
  },

  email: (value: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  },

  password: (value: string): { valid: boolean; message: string } => {
    if (value.length < 6) {
      return { valid: false, message: "密码长度至少6位" };
    }
    if (value.length > 20) {
      return { valid: false, message: "密码长度不能超过20位" };
    }
    if (!/[a-zA-Z]/.test(value) || !/\d/.test(value)) {
      return { valid: false, message: "密码必须包含字母和数字" };
    }
    return { valid: true, message: "" };
  },

  idCard: (value: string): boolean => {
    return /^\d{17}[\dXx]$/.test(value);
  },

  required: (value: unknown): boolean => {
    if (value === null || value === undefined) return false;
    if (typeof value === "string") return value.trim().length > 0;
    if (Array.isArray(value)) return value.length > 0;
    return true;
  },

  minLength: (value: string, min: number): boolean => {
    return value.length >= min;
  },

  maxLength: (value: string, max: number): boolean => {
    return value.length <= max;
  },

  range: (value: number, min: number, max: number): boolean => {
    return value >= min && value <= max;
  },

  url: (value: string): boolean => {
    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  },
};

export const formatters = {
  phoneHidden: (phone: string): string => {
    if (!phone || phone.length !== 11) return phone;
    return phone.replace(/(\d{3})\d{4}(\d{4})/, "$1****$2");
  },

  emailHidden: (email: string): string => {
    if (!email) return email;
    const [name, domain] = email.split("@");
    if (!domain) return email;
    const hiddenName = name.length > 2 ? name.slice(0, 2) + "***" : name + "***";
    return `${hiddenName}@${domain}`;
  },

  idCardHidden: (idCard: string): string => {
    if (!idCard || idCard.length !== 18) return idCard;
    return idCard.replace(/(\d{6})\d{8}(\d{4})/, "$1********$2");
  },
};

export const messages = {
  required: "此项为必填项",
  phone: "请输入正确的手机号",
  email: "请输入正确的邮箱地址",
  password: "密码格式不正确",
  idCard: "请输入正确的身份证号",
  minLength: (min: number) => `长度不能少于${min}个字符`,
  maxLength: (max: number) => `长度不能超过${max}个字符`,
};
