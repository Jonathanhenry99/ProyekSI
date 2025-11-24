import java.util.*;
import java.io.*;

public class TestCaseGenerator {
    static Random rnd = new Random();
    
    static class Point {
        int x, y;
        Point(int x, int y) {
            this.x = x;
            this.y = y;
        }
        
        @Override
        public boolean equals(Object o) {
            if (this == o) return true;
            if (o == null || getClass() != o.getClass()) return false;
            Point point = (Point) o;
            return x == point.x && y == point.y;
        }
        
        @Override
        public int hashCode() {
            return Objects.hash(x, y);
        }
    }
    
    // Generate test case dengan distribusi random
    static void generateRandomTestCase(String filename, int m, int n, 
                                       double houseRatio, double treeRatio, int housesPerStation) {
        try {
            PrintWriter pw = new PrintWriter(new FileWriter(filename));
            
            int totalCells = m * n;
            int h = (int)(totalCells * houseRatio);
            int t = (int)(totalCells * treeRatio);
            int p = Math.max(1, h / housesPerStation);
            
            Set<Point> occupied = new HashSet<>();
            List<Point> houses = new ArrayList<>();
            List<Point> trees = new ArrayList<>();
            
            // Generate rumah
            while (houses.size() < h) {
                int x = 1 + rnd.nextInt(m);
                int y = 1 + rnd.nextInt(n);
                Point pt = new Point(x, y);
                
                if (!occupied.contains(pt)) {
                    occupied.add(pt);
                    houses.add(pt);
                }
            }
            
            // Generate pohon
            while (trees.size() < t) {
                int x = 1 + rnd.nextInt(m);
                int y = 1 + rnd.nextInt(n);
                Point pt = new Point(x, y);
                
                if (!occupied.contains(pt)) {
                    occupied.add(pt);
                    trees.add(pt);
                }
            }
            
            // Write to file
            pw.printf("%d %d%n", m, n);
            pw.printf("%d %d %d%n", p, h, t);
            
            for (Point house : houses) {
                pw.printf("%d %d%n", house.x, house.y);
            }
            
            for (Point tree : trees) {
                pw.printf("%d %d%n", tree.x, tree.y);
            }
            
            pw.close();
            
            System.out.printf("Generated %s: %dx%d grid, %d houses, %d trees, %d stations%n", 
                            filename, m, n, h, t, p);
            
        } catch (IOException e) {
            System.err.println("Error: " + e.getMessage());
        }
    }
    
    // Generate test case dengan cluster
    static void generateClusteredTestCase(String filename, int m, int n, 
                                         int numClusters, int housesPerCluster, 
                                         double treeRatio, int housesPerStation) {
        try {
            PrintWriter pw = new PrintWriter(new FileWriter(filename));
            
            Set<Point> occupied = new HashSet<>();
            List<Point> houses = new ArrayList<>();
            List<Point> trees = new ArrayList<>();
            
            // Generate cluster centers
            List<Point> centers = new ArrayList<>();
            for (int i = 0; i < numClusters; i++) {
                int cx = 1 + rnd.nextInt(m);
                int cy = 1 + rnd.nextInt(n);
                centers.add(new Point(cx, cy));
            }
            
            // Generate rumah di sekitar cluster centers
            for (Point center : centers) {
                int generated = 0;
                int attempts = 0;
                
                while (generated < housesPerCluster && attempts < housesPerCluster * 10) {
                    // Generate dalam radius dari center
                    int radius = 5;
                    int dx = -radius + rnd.nextInt(2 * radius + 1);
                    int dy = -radius + rnd.nextInt(2 * radius + 1);
                    
                    int x = Math.max(1, Math.min(m, center.x + dx));
                    int y = Math.max(1, Math.min(n, center.y + dy));
                    
                    Point pt = new Point(x, y);
                    
                    if (!occupied.contains(pt)) {
                        occupied.add(pt);
                        houses.add(pt);
                        generated++;
                    }
                    attempts++;
                }
            }
            
            int h = houses.size();
            int totalCells = m * n;
            int t = (int)(totalCells * treeRatio);
            int p = Math.max(1, h / housesPerStation);
            
            // Generate pohon
            while (trees.size() < t) {
                int x = 1 + rnd.nextInt(m);
                int y = 1 + rnd.nextInt(n);
                Point pt = new Point(x, y);
                
                if (!occupied.contains(pt)) {
                    occupied.add(pt);
                    trees.add(pt);
                }
            }
            
            // Write to file
            pw.printf("%d %d%n", m, n);
            pw.printf("%d %d %d%n", p, h, t);
            
            for (Point house : houses) {
                pw.printf("%d %d%n", house.x, house.y);
            }
            
            for (Point tree : trees) {
                pw.printf("%d %d%n", tree.x, tree.y);
            }
            
            pw.close();
            
            System.out.printf("Generated %s: %dx%d grid, %d clusters, %d houses, %d trees, %d stations%n", 
                            filename, m, n, numClusters, h, t, p);
            
        } catch (IOException e) {
            System.err.println("Error: " + e.getMessage());
        }
    }
    
    public static void main(String[] args) {
        System.out.println("Generating test cases...\n");
        
        // Test case KECIL (20x20)
        // 15-20% rumah, 20-25% pohon, 15-25 rumah per fire station
        generateRandomTestCase("test_small_1.txt", 20, 20, 0.15, 0.20, 20);
        generateRandomTestCase("test_small_2.txt", 20, 20, 0.18, 0.23, 18);
        generateRandomTestCase("test_small_3.txt", 20, 20, 0.20, 0.25, 15);
        
        // Test case MENENGAH (40x40)
        generateRandomTestCase("test_medium_1.txt", 40, 40, 0.15, 0.20, 20);
        generateRandomTestCase("test_medium_2.txt", 40, 40, 0.18, 0.23, 18);
        generateRandomTestCase("test_medium_3.txt", 40, 40, 0.20, 0.25, 15);
        
        // Test case BESAR (80x80)
        generateRandomTestCase("test_large_1.txt", 80, 80, 0.15, 0.20, 20);
        generateRandomTestCase("test_large_2.txt", 80, 80, 0.18, 0.23, 18);
        generateRandomTestCase("test_large_3.txt", 80, 80, 0.20, 0.25, 15);
        
        System.out.println();
        
        // Test case dengan CLUSTER
        generateClusteredTestCase("test_clustered_small.txt", 30, 30, 3, 20, 0.22, 18);
        generateClusteredTestCase("test_clustered_medium.txt", 50, 50, 5, 30, 0.22, 18);
        generateClusteredTestCase("test_clustered_large.txt", 60, 60, 4, 50, 0.22, 20);
        
        System.out.println("\nAll test cases generated successfully!");
    }
}