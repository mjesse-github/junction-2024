
export type ImageItem = {
    imageName: string;
    correctAnswer: string;
    description: string;
    category: string;
    charity: {
      name: string;
      url: string;
    };
  };

  export const imageItems: ImageItem[] = [
    {
      imageName: "landfill.png",
      correctAnswer: "Landfill",
      description: "A landfill site in the Nevada Desert",
      category: "Waste Management",
      charity: {
        name: "Clean Up The World",
        url: "https://www.cleanuptheworld.org/"
      },
    },
    {
      imageName: "solar-farm-1.png",
      correctAnswer: "Solar Farm",
      description: "A solar farm, whichs picture looks like it could skyscrapers",
      category: "Renewable Energy",
      charity: {
        name: "Solar Aid",
        url: "https://solar-aid.org/"
      },
    },
    // Add more items as needed
  ];
