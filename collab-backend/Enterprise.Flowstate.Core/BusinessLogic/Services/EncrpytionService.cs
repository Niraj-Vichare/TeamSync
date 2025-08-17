using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Enterprise.Flowstate.BAL.BusinessLogic.Services
{
    using System.Security.Cryptography;
    using System.Text;

    public static class EncryptionService
    {
        private static string encryptionKey = "CNOYMOu:wyq-8++7\"goMYuju()b{u6";

        // Ensure the key is 32 bytes long
        private static byte[] GetKey()
        {
            byte[] keyBytes = Encoding.UTF8.GetBytes(encryptionKey);
            if (keyBytes.Length < 32)
            {
                Array.Resize(ref keyBytes, 32);  // Pad if shorter
            }
            else if (keyBytes.Length > 32)
            {
                Array.Resize(ref keyBytes, 32);  // Truncate if longer
            }
            return keyBytes;
        }

        public static string EncryptData(string data)
        {
            using (Aes aesAlg = Aes.Create())
            {
                aesAlg.Key = GetKey();  // Ensure the key is the correct size
                aesAlg.IV = new byte[16]; // Initialization vector can be set to zero or random bytes

                using (ICryptoTransform encryptor = aesAlg.CreateEncryptor(aesAlg.Key, aesAlg.IV))
                {
                    using (MemoryStream msEncrypt = new MemoryStream())
                    {
                        using (CryptoStream csEncrypt = new CryptoStream(msEncrypt, encryptor, CryptoStreamMode.Write))
                        {
                            using (StreamWriter swEncrypt = new StreamWriter(csEncrypt))
                            {
                                swEncrypt.Write(data);
                            }
                        }
                        return Convert.ToBase64String(msEncrypt.ToArray());
                    }
                }
            }
        }

        public static string DecryptData(string encryptedData)
        {
            using (Aes aesAlg = Aes.Create())
            {
                aesAlg.Key = GetKey();  // Ensure the key is the correct size
                aesAlg.IV = new byte[16]; // Initialization vector should match the one used during encryption

                using (ICryptoTransform decryptor = aesAlg.CreateDecryptor(aesAlg.Key, aesAlg.IV))
                {
                    using (MemoryStream msDecrypt = new MemoryStream(Convert.FromBase64String(encryptedData)))
                    {
                        using (CryptoStream csDecrypt = new CryptoStream(msDecrypt, decryptor, CryptoStreamMode.Read))
                        {
                            using (StreamReader srDecrypt = new StreamReader(csDecrypt))
                            {
                                return srDecrypt.ReadToEnd();
                            }
                        }
                    }
                }
            }
        }
    }

}
