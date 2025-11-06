import java.util.Scanner;

public class anagram {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String s = sc.next();
        String s2 = sc.next();

        if(cekAnagram(s, s2)){
            System.out.println("Anagram");
        }else{
            System.out.println("Not Anagram");
        }
    }



        public static boolean cekAnagram(String s, String s2) {
            if(s.length() == s2.length()){
                if(s.charAt(0)== s2.charAt(s2.length()-1)){

                    return true;
                }else{
                    return false;
                }
                
            }
            return false;

    }
    
}
