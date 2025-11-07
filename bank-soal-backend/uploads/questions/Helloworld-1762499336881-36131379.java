/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Main.java to edit this template
 */
package helloworld;

/**
 *
 * @author jonathanhenry
 */
import jade.core.Agent;
import javax.swing.JOptionPane;

public class Helloworld extends Agent {

    protected void setup() {
        System.out.println("Hello World. ");
        System.out.println("My name is " + getLocalName());
        JOptionPane.showMessageDialog(null, "My Name is " + getLocalName());
    }
}
