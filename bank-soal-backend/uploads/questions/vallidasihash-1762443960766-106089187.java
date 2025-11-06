import java.util.Scanner;

public class vallidasihash{
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        
        int n = sc.nextInt();
        for (int i = 0; i < n; i++) {
            int hasil = sc.nextInt();
            String str = sc.next();
        int result = cekHash(str);
        if(result == hasil){
            System.out.println("utuh");
        }else{
            System.out.println("rusak");
        }
     }
    }
    public static int cekHash(String str){
        int hashValue = 0;

        for(int i = 0;i<str.length();i++){
            hashValue = (hashValue * 256 +str.charAt(i)) % 7121;
        }
          
        return  hashValue;
        
    }
    
}