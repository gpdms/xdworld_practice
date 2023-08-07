package com.example.demo.controller;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.net.MalformedURLException;
import java.net.URL;
import java.net.URLConnection;
import java.net.URLEncoder;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import lombok.extern.log4j.Log4j2;

@Controller
@Log4j2
public class MainController {

	
	@GetMapping("/main")
	public String main() {
		return "map";
	}
	
	@ResponseBody
	@PostMapping("/search")
	public String search(@RequestParam String keyword, @RequestParam String currentPage) {
		log.info("컨트롤러 도착한 keyword:"+keyword);
		
		StringBuffer sbuf = new StringBuffer();
		
		try {
			
			// 프록시 설정
//			System.setProperty("http.proxyHost", "localhost") ;
//			System.setProperty("http.proxyPort", "8080");
			
			String vworldurl = "https://api.vworld.kr/req/search?service=search&request=search&version=2.0"
					+ "&size=10"
					+ "&page=" + currentPage
					+ "&query=" + keyword
					+ "&type=place"
					+ "&format=json"
					+ "&errorformat=json"
					+ "&key=DD524C3D-6343-312F-941A-000185A9D92B";
//			String vworldurl = "https://api.vworld.kr/req/search?service=search&request=search&version=2.0&size=10&page=1&type=place&format=json&errorformat=json&key=DD524C3D-6343-312F-941A-000185A9D92B&query=공간정보산업진흥원"
						
			// URL 객체 생성
			URL url = new URL(vworldurl);
			
			// URLConnection 생성
			URLConnection urlConn = url.openConnection();
			
			
			InputStream is = urlConn.getInputStream();
			InputStreamReader isr = new InputStreamReader(is, "UTF-8");


			BufferedReader br = new BufferedReader(isr);

			String str ;

			// 라인이 끝날때까지 한줄씩 읽어서 StringBuffer에 담는다.
			while((str=br.readLine()) != null){
			sbuf.append(str + "\r\n") ;
			}
		    
			// 콘솔에 출력하기
			System.out.println(sbuf.toString()) ;
			
		} catch (MalformedURLException e) {
			e.printStackTrace();
		} catch (IOException e) {
			e.printStackTrace();
		}
					
		
		
		return sbuf.toString();
		
	}
	
}
