import java.util.*;

public class kembar {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);

        int n = sc.nextInt();
        while(n-->0){
            String huruf = sc.next();
            System.out.println( cekHuruf(huruf) );
        }
    }


    public static int cekHuruf(String s){

        if(s.length()<1){
            return 0;
        }
        int count = 0;
        int panjang = s.length();

        for(int i=0;i<panjang-2;i++){
            char ch = s.charAt(i);
            char a = s.charAt(i+2);
            if(ch== a){
                count++;
            }
           
        }
        return count;
    }
}
