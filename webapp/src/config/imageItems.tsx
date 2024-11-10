export type ImageItem = {
    imageName: string;
    correctAnswer: string;
    description: string;
    category: string;
    charity: {
      name: string;
      url: string;
      fact: string;
    };
  };

  export const imageItems: ImageItem[] = [
    {
      imageName: "landfill.png",
      correctAnswer: "Landfill",
      description: "A monstrous landfill in New Dehli",
      category: "Waste Management",
      charity: {
        name: "World Cleanup Day",
        url: "https://www.worldcleanupday.org",
        fact: "Recycling keeps landfills smaller."
      },
    },
    {
      imageName: "landfill-3.png",
      correctAnswer: "Landfill",
      description: "A landfill site in Estonia",
      category: "Waste Management",
      charity: {
        name: "World Cleanup Day",
        url: "https://www.worldcleanupday.org",
        fact: "World Cleanup Day originated in Estonia in 2008 as 'Let's Do It!', when 50,000 people (4% of the population) united to clean up 10,000 tons of illegal waste across their entire country in just five hours."
      },
    },
    {
      imageName: "circular-farm.jpg",
      correctAnswer: "Circular Farm",
      description: "Circular Farm in Kansas",
      category: "Farming",
      charity: {
        name: "Convoy of Hope",
        url: "https://convoyofhope.org/articles/world-hunger-charities/",
        fact: "Convoy of Hope's Agriculture program has trained over 250,000 farmers in sustainable farming practices across 40 nations, while distributing $2 billion worth of food and supplies since 1994."
      },
    },
    {
      imageName: "coal-plant.png",
      correctAnswer: "Coal plant",
      description: "Coal plant in Pakistan",
      category: "Pollutant",
      charity: {
        name: "Clean Air Fund",
        url: "https://www.cleanairfund.org",
        fact: "Clean Air Fund created a unique 'Visualising Air Pollution' project, raising awareness through authentic visuals."
      },
    },
    {
      imageName: "rainbow.png",
      correctAnswer: "Rainbow",
      description: "Just a rainbow in UK",
      category: "Beauty",
      charity: {
        name: "Rainbow preservation fund",
        url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        fact: "Did you know that climate change decreased occurances of rainbows by 70%? Check out the rainbow preservation fund"
      },
    },
    {
      imageName: "solar-farm-1.png",
      correctAnswer: "Solar Farm",
      description: "A solar farm, which from satellite imagery resembles an urban skyline",
      category: "Renewable Energy",
      charity: {
        name: "Solar Aid",
        url: "https://solar-aid.org/",
        fact: "Solar Aid has distributed over 2.3 million solar lights across Africa since 2006, reducing CO2 emissions by 5.4 million tonnes and saving families an average of $1,000 each in reduced kerosene costs."
      },
    },
    {
      imageName: "wind-mills.png",
      correctAnswer: "Wind mills",
      description: "Wind turbines in a forested area viewed from satellite",
      category: "Renewable Energy",
      charity: {
        name: "WindEurope",
        url: "https://windeurope.org",
        fact: "As of 2023, wind energy provides 17% of Europe's electricity from 236 GW of capacity. By 2027, it's projected to become Europe's primary electricity source, surpassing both nuclear and natural gas."
      },
    },
];
